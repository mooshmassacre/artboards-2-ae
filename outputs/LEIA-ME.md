# Artboards 2 AE — versão 1.0.2

Script JSX para Photoshop desktop, com interface em português. Trabalha em uma cópia aberta do documento; não edita nem salva o original. Projetado para Photoshop com suporte a artboards e ExtendScript.

## Como usar

1. Abra o PSD no Photoshop e deixe-o como documento ativo.
2. Acesse **File > Scripts > Browse…** / **Arquivo > Scripts > Procurar…**.
3. Escolha **Artboards 2 AE.jsx**.
4. Escolha as opções e clique em **Converter cópia**.
5. Revise a cópia e salve como um **novo PSD**. Se habilitado, o script abre a escolha de destino ao terminar. Ele não sobrescreve arquivos existentes.
6. No After Effects, use **File > Import > File** e **Import As: Composition – Retain Layer Sizes**.

Não é necessário instalar o script na pasta do Photoshop. Execute-o pelo menu do Photoshop, não no After Effects.

## O resultado

Cada artboard vira um grupo normal com o mesmo nome. Layers e subgrupos existentes mantêm seus IDs na cópia, sua ordem e sua hierarquia. Textos, Smart Objects, ajustes, máscaras e efeitos nas layers internas não são rasterizados pelo script. A interpretação dessas propriedades no After Effects depende do suporte do importador.

Cada grupo é alinhado pelo canto superior esquerdo de sua artboard ao canto superior esquerdo do canvas final. As layers mantêm suas coordenadas locais dentro da própria artboard; os grupos ficam sobrepostos, prontos para serem alternados ou animados. Um grupo opaco acima de outro pode cobri-lo: oculte os grupos superiores para inspecionar os inferiores. Não há redimensionamento; artboards maiores que a primeira podem ter conteúdo fora do quadro. Os grupos são importados pelo AE como composições aninhadas; `Retain Layer Sizes` não garante que cada precomp terá as dimensões exatas da antiga artboard.

O canvas final usa exatamente o retângulo da **primeira artboard no painel Layers, de cima para baixo**, inclusive se ela estiver oculta. Seu canto superior esquerdo vira a origem do PSD. As demais artboards são deslocadas para a mesma origem, eliminando o espaçamento da disposição lado a lado. O recorte não apaga seus pixels no Photoshop. Para mudar a artboard de referência, coloque-a no topo do painel antes de executar. Limites fracionários são recusados para evitar arredondar o tamanho ou reamostrar layers.

## Opções

- **Preservar recorte:** cria uma máscara retangular no grupo para representar os limites da artboard, sem excluir conteúdo externo. Desative para permitir que elementos vazem dos grupos ao animar.
- **Preservar fundos:** converte fundos brancos, pretos ou personalizados em layers de cor sólida editáveis, limitadas à área da artboard. Fundos transparentes não geram layers.
- **Desbloquear:** deixa as layers da cópia desbloqueadas. Desative para restaurar os bloqueios originais ao final.
- **Salvar ao terminar:** abre a escolha do destino PSD. Cancelar deixa a cópia pronta aberta, sem salvar.

Desativar recortes ou fundos altera intencionalmente a aparência. Os padrões mantêm ambos.

## Coordenadas e verificações

A conversão usa a operação nativa de dissolver artboards e reagrupar seus filhos por ID. Marcadores temporários de um pixel medem possíveis mudanças da origem do documento, inclusive ao dissolver a última artboard. Eles são removidos antes do salvamento.

O script primeiro corrige mudanças involuntárias de origem usando os marcadores. Em seguida, desloca cada grupo pela diferença entre a origem da primeira artboard e sua própria origem. O recorte final transforma essas posições em coordenadas locais: posição final da layer = posição global original − origem da sua artboard. As translações são inteiras; offsets fracionários inesperados são recusados. Depois compara os limites de todas as layers não vazias com os valores anteriores à conversão. O ajuste final do canvas utiliza recorte com exclusão de pixels desativada.

A verificação também confere nomes, hierarquia, ordem, tipos, visibilidade, opacidade e modo de mesclagem. As posições são verificadas antes das novas máscaras. Máscaras e fundos são criados antes de reduzir o canvas, para alcançar também artboards que ficarão fora dele. Uma nova medição dos limites após as máscaras verifica o deslocamento global causado pelo recorte final. Isso não equivale a uma comparação visual pixel a pixel de todos os efeitos.

Se a conversão falhar, a cópia incompleta é fechada sem salvar e o original volta a ficar ativo. Se apenas o salvamento falhar, a cópia convertida fica aberta para salvar manualmente. As preferências de unidades e diálogos são restauradas.

## Limites desta versão

- Requer RGB ou tons de cinza. Não converte o modo de cor automaticamente, para não achatar ou alterar layers.
- Não aceita canvas final acima de 30.000 pixels em qualquer dimensão. O limite de tamanho em disco do PSD também pode impedir o salvamento; nesse caso, divida o trabalho em PSDs menores.
- Máscaras e efeitos aplicados **diretamente ao contêiner da artboard**, assim como opacidade de preenchimento especial nesse contêiner, interrompem a operação com uma mensagem. Coloque esses tratamentos em um subgrupo antes de executar. Máscaras e efeitos nas layers e nos subgrupos internos permanecem intactos.
- Artboards aninhadas em outros grupos são recusadas. A busca é recursiva e não ignora silenciosamente essas estruturas.
- Deslocamentos fracionários inesperados, alterações nos limites das layers ou mudanças de hierarquia interrompem a conversão. Isso evita salvar um resultado cuja geometria não pôde ser confirmada. Layers vinculadas ou comportamentos específicos de uma versão do Photoshop podem acionar essa proteção.
- Layer Comps que dependem dos IDs das antigas artboards podem precisar ser recriadas. O script não reconstrói animações de timeline, vínculos de artboards ou metadados de exportação.
- O AE pode interpretar algumas características do Photoshop de maneira diferente. Revise fontes, Smart Objects, ajustes, estilos e mesclagem após importar.

## Validação realizada

Análise sintática do JavaScript após remover a diretiva específica `#target photoshop`, mais verificações automatizadas, incluindo regressão para artboards lado a lado e origens negativas, além de testes de lógica e estrutura: offsets positivos e negativos, ausência de compensação duplicada, rejeição de mudanças de tamanho e offsets fracionários, normalização de origem, detecção de erro de posição, layers vazias, recorte sem exclusão, ausência de chamadas de rasterização/achatamento e proteção contra sobrescrita.

**Não executado no Photoshop ou After Effects nesta sessão.** Os testes utilizam substitutos das APIs para verificar a lógica; não comprovam o comportamento do Action Manager ou da interface no aplicativo. A sintaxe usa construções compatíveis com ExtendScript, mas não foi analisada pelo interpretador do Photoshop. Faça a primeira execução em um PSD representativo e revise o resultado.

## Referências

O procedimento de dissolução, agrupamento, máscaras e fundos foi conferido no arquivo `Presets/Scripts/ArtboardExport.inc` distribuído com o Photoshop 2026 instalado nesta máquina. O JSX entregue é independente e não precisa desse arquivo para executar.

- [Adobe — propriedades e comportamento de artboards](https://helpx.adobe.com/photoshop/desktop/create-manage-layers/layout-design-tools/artboard-properties.html).
- [Adobe — preparação e importação de imagens e PSDs no After Effects](https://helpx.adobe.com/after-effects/desktop/import-files/import-still-images/preparing-importing-still-images.html).

## Licença e créditos

Titular: **@mooshmassacre**. Leia [a licença completa](LICENSE.md) antes de usar ou adaptar. Uso não comercial e adaptações internas são permitidos com créditos. Uso comercial exige cadastro escrito e royalties de **10% do lucro por trabalho**, definido como receita recebida menos custos diretos elegíveis comprovados. Redistribuição e revenda dependem de autorização escrita.

Crédito obrigatório: **Ferramenta utilizada: Artboards 2 AE — @mooshmassacre. https://github.com/mooshmassacre/artboards-2-ae**

Guarde `LICENSE.md` junto ao JSX. A licença proprietária não transfere a autoria dos seus trabalhos finais ao titular da ferramenta.

## Cadastro comercial

Escreva para **gustavo@mooshmassacre.studio**. Brasil: Pix em reais. Clientes internacionais: PayPal com moeda acordada no cadastro. O atendimento fornecerá os dados de pagamento em privado; não presuma que o e-mail seja uma chave de pagamento.

Consulte [o processo comercial](comercial/PROCESSO-COMERCIAL.md) e os [modelos de mensagens e demonstrativos](comercial/MODELOS-DE-MENSAGENS.md). O uso comercial começa após aceite e ativação escrita.
