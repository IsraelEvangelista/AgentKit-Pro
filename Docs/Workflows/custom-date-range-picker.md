---
name: custom-date-range-picker
description: Implementa DateRangePicker customizado com deseleção no react-day-picker v8.
---

# Custom Date Range Picker

## Instruções

1. Entenda o problema
   - O Calendar do shadcn/ui com `mode="range"` (react-day-picker v8) não permite desmarcar datas clicando nelas, pois o modo range intercepta cliques.

2. Aplique a solução correta
   - Crie um wrapper que não usa `mode`.
   - Controle toda a seleção via `onDayClick`.
   - Estilize o intervalo com `modifiers` (`selected`, `range_start`, `range_end`, `range_middle`).

3. Implemente o componente

```tsx
// src/components/ui/custom-date-range-picker.tsx
import * as React from "react";
import { DayPicker, DayClickEventHandler } from "react-day-picker";
import { Locale } from "date-fns";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface CustomDateRangePickerProps {
  selected: DateRange;
  onSelect: (range: DateRange) => void;
  numberOfMonths?: number;
  locale?: Locale;
  className?: string;
}

export function CustomDateRangePicker({
  selected,
  onSelect,
  numberOfMonths = 2,
  locale,
  className,
}: CustomDateRangePickerProps) {
  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    if (modifiers.disabled) return;

    const dayTime = new Date(day).setHours(0, 0, 0, 0);
    const startTime = selected.from ? new Date(selected.from).setHours(0, 0, 0, 0) : null;
    const endTime = selected.to ? new Date(selected.to).setHours(0, 0, 0, 0) : null;

    const isStart = startTime !== null && dayTime === startTime;
    const isEnd = endTime !== null && dayTime === endTime;
    const hasRange = startTime !== null && endTime !== null && startTime !== endTime;

    if (isStart && hasRange) {
      onSelect({ from: selected.to, to: selected.to });
      return;
    }

    if (isEnd && hasRange) {
      onSelect({ from: selected.from, to: selected.from });
      return;
    }

    if (isStart && isEnd) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      onSelect({ from: today, to: today });
      return;
    }

    if (!selected.from || hasRange) {
      onSelect({ from: day, to: day });
      return;
    }

    if (day < selected.from) {
      onSelect({ from: day, to: selected.from });
    } else {
      onSelect({ from: selected.from, to: day });
    }
  };

  const modifiers = {
    selected:
      selected.from && selected.to
        ? { from: selected.from, to: selected.to }
        : selected.from
          ? [selected.from]
          : [],
    range_start: selected.from ? [selected.from] : [],
    range_end: selected.to ? [selected.to] : [],
    range_middle:
      selected.from && selected.to && selected.from.getTime() !== selected.to.getTime()
        ? { after: selected.from, before: selected.to }
        : [],
  };

  return (
    <DayPicker
      modifiers={modifiers}
      onDayClick={handleDayClick}
      numberOfMonths={numberOfMonths}
      locale={locale}
      className={className}
    />
  );
}
```

4. Preserve a experiência do shadcn/ui
   - Copie `classNames` do Calendar do shadcn/ui para manter a estilização.
   - Normalize datas com `setHours(0,0,0,0)` para comparação consistente.

## Exemplos

### Exemplo 1: Uso do componente

```tsx
import { CustomDateRangePicker } from "@/components/ui/custom-date-range-picker";
import { ptBR } from "date-fns/locale";

<CustomDateRangePicker
  selected={{ from: dateRange.start, to: dateRange.end }}
  onSelect={(range) => {
    if (range.from && range.to) {
      setDateRange({ start: range.from, end: range.to });
    }
  }}
  numberOfMonths={2}
  locale={ptBR}
/>
```

### Exemplo 2: Regras de comportamento suportadas

- Clicar em data de início (com intervalo): remove início, mantém fim.
- Clicar em data de fim (com intervalo): remove fim, mantém início.
- Clicar em data única selecionada: reseta para a data atual.
- Primeiro clique em nova data: seleciona data única.
- Segundo clique em outra data: constrói intervalo ordenado.

### Exemplo 3: Referências

- https://daypicker.dev/guides/custom-selections
- react-day-picker v8.x
- shadcn/ui Calendar
