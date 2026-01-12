---
name: state-persistence-context
description: Persiste estado entre páginas usando React Context, sem refazer buscas/filtros.
---

# State Persistence

## Instruções

1. Defina quando usar
   - Persistir busca/filtros ao navegar.
   - Manter estado de formulários multi-step.
   - Preservar preferências de visualização.

2. Crie um Context dedicado
   - Crie `src/contexts/[Nome]Context.tsx`.
   - Modele o estado e exponha setters com `useCallback`.
   - Evite `any`; use `unknown` ou tipagem específica.

3. Integre o Provider no app
   - Envolva as rotas com o Provider.
   - Posicione o Provider de modo que o estado sobreviva à navegação (fora do Router, quando aplicável).

4. Use o Context nas páginas
   - Substitua `useState` local pelo hook do Context.
   - Mantenha estados de loading/error como locais (não persistir globalmente).

5. Adicione limpeza quando necessário
   - Exponha `clearState` para logout/reset.

## Exemplos

### Exemplo 1: Criar Context

```typescript
import React, { createContext, useContext, useState, useCallback } from "react";

interface StateType {
  query: string;
  results: unknown[];
}

interface ContextType {
  state: StateType;
  setQuery: (value: string) => void;
  setResults: (value: unknown[]) => void;
  clearState: () => void;
}

const initialState: StateType = {
  query: "",
  results: [],
};

const MyContext = createContext<ContextType>({
  state: initialState,
  setQuery: () => {},
  setResults: () => {},
  clearState: () => {},
});

export function MyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StateType>(initialState);

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, []);

  const setResults = useCallback((results: unknown[]) => {
    setState((prev) => ({ ...prev, results }));
  }, []);

  const clearState = useCallback(() => {
    setState({ ...initialState });
  }, []);

  return (
    <MyContext.Provider value={{ state, setQuery, setResults, clearState }}>{children}</MyContext.Provider>
  );
}

export const useMyContext = () => useContext(MyContext);
```

### Exemplo 2: Integrar Provider no App

```tsx
import { MyProvider } from "./contexts/MyContext";

const App = () => (
  <AuthProvider>
    <MyProvider>
      <Router>{/* Routes */}</Router>
    </MyProvider>
  </AuthProvider>
);
```

### Exemplo 3: Usar o Context na página

```tsx
const { state, setQuery, setResults } = useMyContext();
// state.query, state.results
```
