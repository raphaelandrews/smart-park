import { Checkbox } from "@web/ui/components/checkbox";
import { Input } from "@web/ui/components/input";
import { Label } from "@web/ui/components/label";
import { Textarea } from "@web/ui/components/textarea";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { HTMLAttributes, ReactNode } from "react";

function FieldShell({
  id,
  label,
  error,
  description,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  description,
  type = "text",
  placeholder,
  autoComplete,
  autoCapitalize,
  spellCheck,
  maxLength,
  inputMode,
  min,
  max,
  step,
  disabled,
}: {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  description?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  autoCapitalize?: string;
  spellCheck?: boolean;
  maxLength?: number;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: number | string;
  max?: number | string;
  step?: number | string;
  disabled?: boolean;
}) {
  return (
    <FieldShell id={id} label={label} error={error} description={description}>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        spellCheck={spellCheck}
        maxLength={maxLength}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  description,
  placeholder,
  maxLength,
  rows = 3,
}: {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  description?: string;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <FieldShell id={id} label={label} error={error} description={description}>
      <Textarea
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options,
  error,
  description,
  placeholder = "Selecione",
  disabled,
}: {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  error?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <FieldShell id={id} label={label} error={error} description={description}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-none transition-[color,box-shadow] outline-none hover:border-subtle-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  onBlur,
  description,
  error,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  description?: string;
  error?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-start gap-2.5">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onChange(Boolean(value))}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <div className="grid gap-0.5">
          <Label htmlFor={id} className="cursor-pointer">
            {label}
          </Label>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-bg px-3 py-2.5 text-sm text-danger"
    >
      <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
