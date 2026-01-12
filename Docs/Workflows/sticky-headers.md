---
name: sticky-headers
description: Roteiro para implementação de cabeçalhos fixos (Sticky Headers) empilhados com suporte a componentes de filtro e compensação de layout.
---

# Sticky Headers (Cabeçalhos Fixos)
## Instruções
Esta skill define o padrão para implementar cabeçalhos "sticky" que empilham múltiplos elementos (ex: filtros + cabeçalho de tabela) e ficam fixos no topo da área de rolagem, garantindo que não haja "gaps" (espaços vazados) onde o conteúdo passa por trás.
### 1. Diagnóstico e Estrutura
Antes de aplicar o estilo `sticky`, identifique a estrutura do DOM:
- **Container de Rolagem**: Identifique qual elemento pai possui `overflow-y-auto`. O comportamento `sticky` será relativo a este elemento.
- **Padding do Container**: Verifique se o container de rolagem possui padding (ex: `p-4`, `p-6`). Isso é a causa principal de "gaps" visuais.
### 2. Padrão "Stacked Sticky Wrapper"
Para garantir que múltiplos elementos (ex: Filtros + TableHeader) fiquem fixos juntos e sincronizados:
1.  **Agrupe em um único container sticky**:
    Ao invés de tentar calcular alturas dinâmicas para múltiplos elementos sticky, coloque todos os elementos que devem ficar fixos dentro de um único `CardHeader` ou `div` container.
    ```tsx
    // ✅ CORRETO: Wrapper único sticky contendo filtros e header
    <CardHeader className="sticky top-0 z-20 ...">
      <Filtros />
      <TableHeader />
    </CardHeader>
    <CardContent>
      <TableBody>...</TableBody> { /* Apenas o corpo rola */ }
    </CardContent>
    ```
    ```tsx
    // ❌ ERRADO: Elementos separados (comportamento instável)
    <CardHeader className="sticky top-0 ...">Filters</CardHeader>
    <TableHeader className="sticky top-[???] ...">Headers</TableHeader>
    ```
### 3. Compensação de Padding (Gap Fix)
Se o container principal de rolagem tiver padding (comum em layouts dashboards), o elemento `sticky top-0` ficará fixo no topo do *conteúdo*, respeitando o padding, o que cria um espaço vazio visível acima dele onde o conteúdo rola "por trás".
**Solução**: Aplique margem negativa no topo e lateral do elemento sticky para anular o padding do container pai.
-   Se o pai tem `p-4`: Use `-top-4 -mx-4 px-4`
-   Se o pai tem `p-6`: Use `-top-6 -mx-6 px-6`
### 4. Checklist de Implementação
1.  [ ] **Wrapper Único**: Mova o `TableHeader` para dentro do container sticky (ex: `CardHeader`).
2.  [ ] **Isolamento do Scroll**: Garanta que o `TableBody` esteja em um container separado (ex: `CardContent`) que flui normalmente.
3.  [ ] **Background Opaco**: O container sticky deve ter `bg-background` ou cor sólida para evitar transparência.
4.  [ ] **Z-Index**: Aplique `z-20` ou superior para garantir que fique sobre o conteúdo.
5.  [ ] **Compensação**: Se houver "gap" no topo, aplique a técnica de margem negativa correspondente ao padding do layout.
## Exemplos
### Implementação Básica (Sem padding no pai)
```tsx
<Card>
  {/* Container Sticky: Filtros + Header da Tabela */}
  <CardHeader className="sticky top-0 z-20 bg-background border-b">
    <div className="flex gap-2 mb-4">
      {/* Filtros aqui */}
      <Input placeholder="Filtrar..." />
    </div>
    
    <Table>
      <TableHeader className="bg-muted">
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Valor</TableHead>
        </TableRow>
      </TableHeader>
      {/* Note: TableBody NÃO está aqui */}
    </Table>
  </CardHeader>
  {/* Conteúdo rolável */}
  <CardContent className="p-0">
    <Table>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.nome}</TableCell>
            <TableCell>{item.valor}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```
### Implementação Robusta (Com compensação de layout)
Use este padrão quando o layout principal (`MainLayout`) injeta padding (ex: `p-4 sm:p-6`) no container de scroll.
```tsx
// Exemplo em uma Page.tsx
export default function Page() {
  return (
    <div className="relative min-h-[400px] flex flex-col">
      {/* Wrapper do sticky header com compensação */}
      {/* -top-4 sm:-top-6: Compensa o padding vertical do layout */}
      {/* -mx-4 sm:-mx-6: Compensa o padding horizontal (estende até a borda) */}
      {/* px-4 sm:px-6: Restaura o padding interno para o conteúdo não colar na borda */}
      <CardHeader 
        className="sticky -top-4 sm:-top-6 z-20 bg-background pb-3 border-b -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 sm:pt-6"
      >
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold">Relatório</h2>
           <FiltrosComponent />
        </div>
        <Table>
          <TableHeader className="bg-primary text-primary-foreground">
             <TableRow>
               <TableHead className="text-white">Data</TableHead>
               <TableHead className="text-white">Descrição</TableHead>
               <TableHead className="text-white">Valor</TableHead>
             </TableRow>
          </TableHeader>
        </Table>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {/* Linhas de dados... */}
          </TableBody>
        </Table>
      </CardContent>
    </div>
  );
}
```
