import { RefObject } from 'react';
import React, {
  FC, useRef, useEffect, memo,
} from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';
import useFlag from '../../hooks/useFlag';
import useLang from '../../hooks/useLang';

import Loading from './Loading';
import Button from './Button';

import './SearchInput.scss';

type OwnProps = {
  ref?: RefObject<HTMLInputElement>;
  children?: any;
  className?: string;
  inputId?: string;
  value?: string;
  focused?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  canClose?: boolean;
  onChange: (value: string) => void;
  onReset?: NoneToVoidFunction;
  onFocus?: NoneToVoidFunction;
  onBlur?: NoneToVoidFunction;
};

const SearchInput: FC<OwnProps> = ({
  ref,
  children,
  value,
  inputId,
  className,
  focused,
  isLoading,
  placeholder,
  disabled,
  canClose,
  onChange,
  onReset,
  onFocus,
  onBlur,
}) => {
  // eslint-disable-next-line no-null/no-null
  let inputRef = useRef<HTMLInputElement>(null);
  if (ref) {
    inputRef = ref;
  }

  const [isInputFocused, markInputFocused, unmarkInputFocused] = useFlag(focused);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (focused) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
    }
  }, [focused, placeholder]); // Trick for setting focus when selecting a contact to search for

  const lang = useLang();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { currentTarget } = event;
    onChange(currentTarget.value);
  }

  function handleFocus() {
    markInputFocused();
    if (onFocus) {
      onFocus();
    }
  }

  function handleBlur() {
    unmarkInputFocused();
    if (onBlur) {
      onBlur();
    }
  }

  return (
    <div className={buildClassName('SearchInput', className, isInputFocused && 'has-focus')}>
      {children}
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        dir="auto"
        placeholder={placeholder || lang('Search')}
        className="form-control"
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <i className="icon-search" />
      {isLoading && (
        <Loading />
      )}
      {!isLoading && (value || canClose) && onReset && (
        <Button
          round
          size="tiny"
          color="translucent"
          onClick={onReset}
        >
          <span className="icon-close" />
        </Button>
      )}
    </div>
  );
};

export default memo(SearchInput);
