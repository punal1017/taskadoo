"use client";

import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  fullWidth?: boolean;
}

export default function DateField({
  label,
  value,
  onChange,
  minDate,
  fullWidth = false,
}: DateFieldProps) {
  return (
    <DatePicker
      label={label}
      value={value ? dayjs(value) : null}
      minDate={minDate ? dayjs(minDate) : undefined}
      onChange={(date, context) => {
        if (context.validationError) return;
        onChange(date?.format("YYYY-MM-DD") ?? "");
      }}
      slotProps={{ textField: { fullWidth } }}
    />
  );
}
