---
name: loading-efficiency-cache
description: Evita refetch redundante com cache via useRef e filtros locais via useMemo.
---

# Eficiência de Carregamento (Cache de Dados)

## Instruções

1. Reconheça o sintoma
   - Requisições repetidas ao navegar ou ao alterar estado que não deveria disparar fetch.
   - Loading piscando e múltiplas entradas no Network tab.

2. Defina uma chave de cache estável
   - Não use o objeto inteiro como dependência.
   - Derive uma `cacheKey` apenas com parâmetros que realmente exigem novo fetch.

```typescript
const cacheKey = useMemo(() => {
  return `${filterObject.year}-${filterObject.month}`;
}, [filterObject.year, filterObject.month]);
```

3. Implemente cache com useRef
   - Antes de buscar, compare a chave.
   - Exponha um modo `forceRefetch` para mutações.

```typescript
interface CacheEntry<T> {
  key: string;
  data: T[];
}

const cacheRef = useRef<CacheEntry<T> | null>(null);

const fetchData = useCallback(
  async (forceRefetch = false) => {
    if (!forceRefetch && cacheRef.current?.key === cacheKey) return;

    setIsLoading(true);
    try {
      const response = await api.get("/endpoint", { params });
      cacheRef.current = { key: cacheKey, data: response.data };
      setAllData(response.data);
    } finally {
      setIsLoading(false);
    }
  },
  [cacheKey]
);
```

4. Mova filtros para o frontend (sem refetch)
   - Use `useMemo` para busca e filtros locais.

```typescript
const filteredData = useMemo(() => {
  let result = allData;

  if (searchTerm.trim()) {
    result = result.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  if (selectedItem) {
    result = result.filter((item) => item.id === selectedItem.id);
  }

  return result;
}, [allData, searchTerm, selectedItem]);
```

5. Exponha refetch manual
   - Use em CREATE/UPDATE/DELETE ou quando dados de fato mudaram.

```typescript
const refetch = useCallback(() => fetchData(true), [fetchData]);
```

## Exemplos

### Exemplo 1: Dependência ruim vs chave boa

```typescript
// Ruim: muda sempre que o objeto muda
const fetchData = useCallback(async () => {}, [filterObject]);

// Bom: muda apenas quando mês/ano mudam
const cacheKey = useMemo(() => `${filterObject.year}-${filterObject.month}`,
  [filterObject.year, filterObject.month]
);
```

### Exemplo 2: Hook template otimizado

```typescript
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

interface CacheEntry<T> {
  key: string;
  data: T[];
}

interface UseOptimizedDataReturn<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOptimizedData<T>(
  primaryFilter: { year: number; month: number },
  searchTerm: string = ""
): UseOptimizedDataReturn<T> {
  const cacheRef = useRef<CacheEntry<T> | null>(null);
  const [allData, setAllData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => `${primaryFilter.year}-${primaryFilter.month}`,
    [primaryFilter.year, primaryFilter.month]
  );

  const fetchData = useCallback(
    async (forceRefetch = false) => {
      if (!forceRefetch && cacheRef.current?.key === cacheKey) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/data?year=${primaryFilter.year}&month=${primaryFilter.month}`);
        const data = (await response.json()) as T[];
        cacheRef.current = { key: cacheKey, data };
        setAllData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    },
    [cacheKey, primaryFilter.year, primaryFilter.month]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return allData;
    return allData.filter((item) => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allData, searchTerm]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  return { data: filteredData, isLoading, error, refetch };
}
```

### Exemplo 3: Quando usar cache

- Use cache: navegação entre itens já carregados, busca local, filtros locais.
- Não use cache: mudança de período principal que exige novo fetch; após mutação, use `refetch()`.
