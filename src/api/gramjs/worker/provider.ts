import Worker from 'worker-loader!./worker';

import { ApiOnProgress, OnApiUpdate } from '../../types';
import { Methods, MethodArgs, MethodResponse } from '../methods/types';
import { WorkerMessageEvent, ThenArg, OriginRequest } from './types';

import { DEBUG } from '../../../config';
import generateIdFor from '../../../util/generateIdFor';

type RequestStates = {
  messageId: string;
  resolve: Function;
  reject: Function;
  callback?: AnyToVoidFunction;
};

let worker: Worker;
const requestStates = new Map<string, RequestStates>();
const requestStatesByCallback = new Map<AnyToVoidFunction, RequestStates>();

// TODO Re-use `util/WorkerConnector.ts`

export function initApi(onUpdate: OnApiUpdate, sessionInfo = '') {
  if (!worker) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('>>> START LOAD WORKER');
    }

    worker = new Worker();
    subscribeToWorker(onUpdate);
  }

  return makeRequest({
    type: 'initApi',
    args: [sessionInfo],
  });
}

export function callApi<T extends keyof Methods>(fnName: T, ...args: MethodArgs<T>) {
  if (!worker) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('API is not initialized');
    }

    return undefined;
  }

  return makeRequest({
    type: 'callMethod',
    name: fnName,
    args,
  }) as MethodResponse<T>;
}

export function cancelApiProgress(progressCallback: ApiOnProgress) {
  progressCallback.isCanceled = true;

  const { messageId } = requestStatesByCallback.get(progressCallback) || {};
  if (!messageId) {
    return;
  }

  worker.postMessage({
    type: 'cancelProgress',
    messageId,
  });
}

function subscribeToWorker(onUpdate: OnApiUpdate) {
  worker.addEventListener('message', ({ data }: WorkerMessageEvent) => {
    if (data.type === 'update') {
      onUpdate(data.update);
    } else if (data.type === 'methodResponse') {
      const requestState = requestStates.get(data.messageId);
      if (requestState) {
        if (data.error) {
          requestState.reject(data.error);
        } else {
          requestState.resolve(data.response);
        }
      }
    } else if (data.type === 'methodCallback') {
      const requestState = requestStates.get(data.messageId);
      if (requestState && requestState.callback) {
        requestState.callback(...data.callbackArgs);
      }
    } else if (data.type === 'unhandledError') {
      throw data.error;
    }
  });
}

function makeRequest(message: OriginRequest) {
  const messageId = generateIdFor(requestStates);
  const payload: OriginRequest = {
    messageId,
    ...message,
  };

  const requestState = { messageId } as RequestStates;

  // Re-wrap type because of `postMessage`
  const promise: Promise<ThenArg<MethodResponse<keyof Methods>>> = new Promise((resolve, reject) => {
    Object.assign(requestState, { resolve, reject });
  });

  if (typeof payload.args[1] === 'function') {
    const callback = payload.args.pop() as AnyToVoidFunction;
    requestState.callback = callback;
    requestStatesByCallback.set(callback, requestState);
  }

  requestStates.set(messageId, requestState);
  promise
    .catch(() => undefined)
    .finally(() => {
      requestStates.delete(messageId);

      if (requestState.callback) {
        requestStatesByCallback.delete(requestState.callback);
      }
    });

  worker.postMessage(payload);

  return promise;
}
