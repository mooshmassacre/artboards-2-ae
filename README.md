# Artboards 2 AE

Versão **1.0.0** — script JSX para converter artboards do Adobe Photoshop em grupos, preparando um PSD para After Effects.

## Uso

No Photoshop, execute `outputs/Artboards 2 AE.jsx` por **Arquivo → Scripts → Procurar…**.

O script trabalha numa cópia e usa a primeira artboard, de cima para baixo no painel Layers, como canvas final. Preserva a disposição relativa dos grupos, com opções de recorte, fundos editáveis e desbloqueio de layers.

Consulte [o guia completo](outputs/LEIA-ME.md) para instruções e limitações.

## Validação

Com Node.js instalado, execute na raiz do repositório:

```sh
node tests/validate.cjs
```

A análise de sintaxe e os testes de lógica usam substitutos das APIs. A versão 1.0.0 ainda não foi validada dentro do Photoshop ou After Effects.

## Arquivos

- `outputs/Artboards 2 AE.jsx`: script distribuível.
- `outputs/LEIA-ME.md`: documentação para uso.
- `tests/validate.cjs`: validação de sintaxe, geometria e proteções.
- `CHANGELOG.md`: histórico de versões.
