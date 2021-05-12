import React, { Component } from "react";
import classnames from "classnames";
import { ReactSVG } from "react-svg";
import { ActionNotification } from "components";

export const FieldContent = ({
  label = "",
  valid = false,
  hasValue = false,
  focused = false,
  children,
  hideUnderline = false,
  contentClassName = "",
  hideCheck = false,
  outlineClassName = "",
  staticIcons: STATIC_ICONS = {}
}) => {
  return (
    <div className={classnames("field-content")}>
      <div className="d-flex">
        {label && <div className="field-label">{label}</div>}
      </div>
      <div
        className={classnames(
          "field-children",
          { valid, custom: hideUnderline },
          contentClassName
        )}
      >
        {children}
        {!hideCheck && valid && hasValue && (
          <ReactSVG src={STATIC_ICONS.BLACK_CHECK} className="field-valid" />
        )}
      </div>
      {!hideUnderline && (
        <span
          className={classnames("field-content-outline", outlineClassName, {
            focused
          })}
        />
      )}
    </div>
  );
};

export const FieldError = ({
  error,
  displayError,
  className,
  staticIcons: STATIC_ICONS = {},
  getErrorLocalized
}) => (
  <div
    className={classnames("field-error-content", className, {
      "field-error-hidden": !displayError
    })}
  >
    {error && (
      <img
        src={STATIC_ICONS.RED_WARNING}
        className="field-error-icon"
        alt="error"
      />
    )}
    {error && (
      <span className="field-error-text">{getErrorLocalized(error)}</span>
    )}
  </div>
);

class FieldWrapper extends Component {
  render() {
    const {
      children,
      label,
      stringId,
      input: { value },
      meta: { active = false, error = "", touched = false, invalid = false },
      focused = false,
      fullWidth = false,
      visited = false,
      hideUnderline = false,
      className = "",
      onClick = () => {},
      notification,
      hideCheck = false,
      outlineClassName = "",
      getErrorLocalized = error => error,
      staticIcons: STATIC_ICONS = {}
    } = this.props;

    const displayError = !(active || focused) && (visited || touched) && error;
    const hasValue = value || value === false;
    return (
      <div
        className={classnames("field-wrapper", className, {
          error: displayError,
          inline: !fullWidth,
          "with-notification": !!notification,
          "field-valid": !invalid
        })}
      >
        <FieldContent
          stringId={stringId}
          label={label}
          valid={!invalid}
          hasValue={hasValue}
          focused={active || focused}
          hideUnderline={hideUnderline}
          hideCheck={hideCheck}
          outlineClassName={outlineClassName}
          onClick={onClick}
          staticIcons={STATIC_ICONS}
        >
          {children}
          {notification && typeof notification === "object" && (
            <ActionNotification
              {...notification}
              className={classnames("pr-0 pl-0 no_bottom", {
                "with-tick-icon": fullWidth && !invalid && !hideCheck
              })}
              showActionText={true}
            />
          )}
        </FieldContent>
        <FieldError
          displayError={displayError}
          error={error}
          staticIcons={STATIC_ICONS}
          getErrorLocalized={getErrorLocalized}
        />
      </div>
    );
  }
}

FieldWrapper.defaultProps = {
  meta: {},
  input: {
    value: ""
  }
};

export default FieldWrapper;
