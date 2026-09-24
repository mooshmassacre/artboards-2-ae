# Artboards 2 AE

Versão **1.0.2** — script JSX para converter artboards do Adobe Photoshop em grupos, preparando um PSD para After Effects.

## Uso

No Photoshop, execute `outputs/Artboards 2 AE.jsx` por **Arquivo → Scripts → Procurar…**.

O script trabalha numa cópia e usa a primeira artboard, de cima para baixo no painel Layers, como canvas final. Alinha a origem de todas as artboards ao mesmo quadro, preservando as posições internas de suas layers, com opções de recorte, fundos editáveis e desbloqueio de layers.

Consulte [o guia completo](outputs/LEIA-ME.md) para instruções e limitações.

## Validação

Com Node.js instalado, execute na raiz do repositório:

```sh
node tests/validate.cjs
```

A análise de sintaxe e os testes de lógica usam substitutos das APIs. A versão 1.0.2 ainda não foi validada dentro do Photoshop ou After Effects.

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

## Uso comercial

Solicite cadastro em **gustavo@mooshmassacre.studio** antes de iniciar uso comercial. No Brasil, pagamento por **Pix em reais**; para clientes internacionais, **PayPal**, com moeda e condições acordadas no cadastro. Os dados de pagamento são fornecidos em privado.

O fluxo é: solicitação → condições e licença → aceite → ativação escrita → demonstrativo por trabalho → pagamento → confirmação de recebimento. Não há mensalidade ou taxa de cadastro; os royalties seguem a licença.

- [Processo comercial completo](outputs/comercial/PROCESSO-COMERCIAL.md)
- [Modelos de cadastro, aceite e apuração](outputs/comercial/MODELOS-DE-MENSAGENS.md)
- [Modelo vazio de controle interno](outputs/comercial/REGISTRO-INTERNO-MODELO.md)

Somente modelos vazios devem ser versionados. Dados de clientes, contratos preenchidos e comprovantes ficam em armazenamento privado. Este repositório não envia mensagens nem processa pagamentos.
