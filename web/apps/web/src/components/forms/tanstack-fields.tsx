import type { AnyFieldApi } from "@tanstack/react-form";
import type { ComponentProps } from "react";

import { PasswordField } from "@/components/auth/password-field";
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/form-fields";

function clearServerError(field: AnyFieldApi) {
  if (!field.state.meta.errorMap?.onServer) {
    return;
  }
  field.setMeta((previous) => ({
    ...previous,
    errorMap: { ...previous.errorMap, onServer: undefined },
    errorSourceMap: { ...previous.errorSourceMap, onServer: undefined },
  }));
}

/** First visible validation/server error for a TanStack field. */
export function getFieldError(field: AnyFieldApi): string | undefined {
  const meta = field.state.meta;
  if (!meta.isTouched && !field.form.state.isSubmitted) {
    return undefined;
  }

  const error = meta.errors.find((entry) => entry !== undefined && entry !== null);
  if (error === undefined || error === null) {
    return undefined;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return String(error);
}

function changeField(field: AnyFieldApi) {
  return (value: unknown) => {
    field.handleChange(value as never);
    clearServerError(field);
  };
}

type TextFieldProps = Omit<
  ComponentProps<typeof TextField>,
  "value" | "onChange" | "onBlur" | "error"
> & {
  field: AnyFieldApi;
  transformValue?: (value: string) => string;
};

export function FormTextField({ field, transformValue, ...props }: TextFieldProps) {
  const change = changeField(field);
  return (
    <TextField
      {...props}
      name={props.name ?? field.name}
      value={String(field.state.value ?? "")}
      onChange={(value) => change(transformValue ? transformValue(value) : value)}
      onBlur={field.handleBlur}
      error={getFieldError(field)}
    />
  );
}

type TextAreaFieldProps = Omit<
  ComponentProps<typeof TextAreaField>,
  "value" | "onChange" | "onBlur" | "error"
> & { field: AnyFieldApi };

export function FormTextAreaField({ field, ...props }: TextAreaFieldProps) {
  return (
    <TextAreaField
      {...props}
      name={props.name ?? field.name}
      value={String(field.state.value ?? "")}
      onChange={changeField(field) as (value: string) => void}
      onBlur={field.handleBlur}
      error={getFieldError(field)}
    />
  );
}

type SelectFieldProps = Omit<
  ComponentProps<typeof SelectField>,
  "value" | "onChange" | "onBlur" | "error"
> & {
  field: AnyFieldApi;
  onValueChange?: (value: string) => void;
};

export function FormSelectField({ field, onValueChange, ...props }: SelectFieldProps) {
  const change = changeField(field);
  return (
    <SelectField
      {...props}
      name={props.name ?? field.name}
      value={String(field.state.value ?? "")}
      onChange={(value) => {
        change(value);
        onValueChange?.(value);
      }}
      onBlur={field.handleBlur}
      error={getFieldError(field)}
    />
  );
}

type CheckboxFieldProps = Omit<
  ComponentProps<typeof CheckboxField>,
  "checked" | "onChange" | "onBlur" | "error"
> & { field: AnyFieldApi };

export function FormCheckboxField({ field, ...props }: CheckboxFieldProps) {
  return (
    <CheckboxField
      {...props}
      checked={Boolean(field.state.value)}
      onChange={(checked) => changeField(field)(checked)}
      onBlur={field.handleBlur}
      error={getFieldError(field)}
    />
  );
}

type PasswordFieldProps = Omit<
  ComponentProps<typeof PasswordField>,
  "value" | "onChange" | "onBlur" | "error"
> & { field: AnyFieldApi };

export function FormPasswordField({ field, ...props }: PasswordFieldProps) {
  return (
    <PasswordField
      {...props}
      name={props.name ?? field.name}
      value={String(field.state.value ?? "")}
      onChange={changeField(field) as (value: string) => void}
      onBlur={field.handleBlur}
      error={getFieldError(field)}
    />
  );
}
