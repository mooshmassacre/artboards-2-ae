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

## Licença e créditos

Titular: **@mooshmassacre**. Este projeto usa uma [licença proprietária restrita](LICENSE); não é open source.

- Uso não comercial e adaptações internas permitidos com créditos.
- Uso comercial sujeito a cadastro escrito e pagamento de **10% do lucro de cada trabalho** que utilizar a ferramenta, conforme a licença.
- Lucro definido como receita recebida menos custos diretos elegíveis e comprovados; despesas gerais não são dedutíveis.
- Redistribuição, revenda, sublicenciamento e disponibilização como serviço dependem de autorização escrita.

Crédito obrigatório: **Ferramenta utilizada: Artboards 2 AE — @mooshmassacre. https://github.com/mooshmassacre/artboards-2-ae**

O texto completo da licença prevalece sobre este resumo. A licença acompanha as cópias deste commit em diante. A tag histórica `v1.0.0` permanece inalterada e não contém o arquivo de licença.
