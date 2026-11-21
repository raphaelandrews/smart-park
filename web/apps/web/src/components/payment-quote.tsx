import { getErrorMessage } from "@/api/errors";
import type { TicketQuoteResponseDTO } from "@/api/generated";
import { formatCurrency, formatDurationMinutes } from "@/lib/format";

interface PaymentQuoteProps {
  quote?: TicketQuoteResponseDTO;
  isLoading?: boolean;
  error?: unknown;
}

export function PaymentQuote({ quote, isLoading, error }: PaymentQuoteProps) {
  if (isLoading) {
    return (
      <div
        aria-live="polite"
        className="rounded-xl bg-secondary px-4 py-4 text-sm text-muted-foreground"
      >
        Calculando o valor da sessão...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger"
      >
        {getErrorMessage(error)}
      </div>
    );
  }

  if (!quote) {
    return (
      <p className="text-[13px] leading-[18px] text-muted-foreground">
        Selecione uma sessão para ver o valor calculado.
      </p>
    );
  }

  const isOpen = Boolean(quote.open);

  return (
    <section
      aria-live="polite"
      className="rounded-xl bg-secondary px-4 py-3"
      aria-label="Valor calculado pelo servidor"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] leading-[18px] text-muted-foreground">
          {isOpen ? "Valor atual" : "Valor final"}
        </span>
        <span className="text-xl leading-[26px] font-semibold tabular-nums">
          {formatCurrency(quote.amount ?? 0)}
        </span>
      </div>
      <dl className="mt-2 grid gap-1 text-[13px] leading-[18px] text-muted-foreground">
        <div className="flex justify-between gap-3">
          <dt>Duração</dt>
          <dd className="tabular-nums">{formatDurationMinutes(quote.durationMinutes)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Tolerância</dt>
          <dd className="tabular-nums">{quote.toleranceMinutes ?? 0} min</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Horas cobradas</dt>
          <dd className="tabular-nums">{quote.chargedHours ?? 0}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Tarifa</dt>
          <dd className="text-right tabular-nums">
            {formatCurrency(quote.firstHourRate ?? 0)} na 1ª hora ·{" "}
            {formatCurrency(quote.additionalHourRate ?? 0)}/h adicional
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
        {isOpen
          ? "O valor final é calculado no pagamento e pode variar até a confirmação."
          : "Valor calculado pelo servidor com base na tarifa e no tempo da sessão."}
      </p>
    </section>
  );
}
