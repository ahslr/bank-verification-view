import React from "react";
import { Field } from "redux-form";
import InputField from "./FormFields/InputField";

const renderFields = (fields = {}, callback) => {
  return (
    <div>
      {Object.keys(fields).map(key => {
        const { type, validate = [], ...rest } = fields[key];
        const commonProps = {
          callback,
          key,
          name: key,
          type,
          validate,
          ...rest
        };

        switch (type) {
          case "text":
          default:
            return <Field component={InputField} {...commonProps} />;
        }
      })}
    </div>
  );
};

export default renderFields;
