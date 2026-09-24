# Histórico de versões

## 1.0.2 — 2026-09-24

- Corrige grupos fora do quadro: todas as artboards agora são alinhadas pela origem ao canvas da primeira, mantendo as coordenadas internas das layers.
- Fundos e máscaras de recorte acompanham o novo posicionamento.
- Grupos ficam sobrepostos, sem escala; grupos opacos superiores podem cobrir os inferiores.
- Testes de regressão para múltiplas artboards e origens negativas.
- Validação manual bem-sucedida no Photoshop e After Effects confirmada por @mooshmassacre em 24/09/2026, para o fluxo testado; versões dos aplicativos e detalhes do PSD não informados.

## 1.0.1 — 2026-09-23

- Primeira distribuição empacotada com a licença proprietária e o guia.
- Inclui processo comercial e modelos de cadastro e apuração.
- Sem mudanças na lógica de conversão; validação no Photoshop e After Effects ainda pendente.

## Processo comercial — 2026-09-23

- Canal oficial gustavo@mooshmassacre.studio; Pix em BRL e PayPal internacional.
- Fluxo de cadastro, aceite, ativação, apuração e confirmação de pagamento.
- Modelos vazios de mensagens e registro interno; dados preenchidos fora do Git.

## Licenciamento — 2026-09-23

- Licença proprietária restrita em nome de @mooshmassacre.
- Créditos obrigatórios, adaptações internas e royalties de 10% do lucro por trabalho comercial.
- Código funcional permanece na versão 1.0.0; a tag histórica não foi alterada.

## 1.0.0 — 2026-09-23

Primeira versão oficial do Artboards 2 AE.

- Conversão de artboards em grupos numa cópia do documento.
- Canvas final definido pela primeira artboard no painel Layers.
- Preservação da hierarquia e verificação de coordenadas.
- Opções de máscaras de recorte, fundos editáveis e desbloqueio.
- Interface ScriptUI em português e salvamento em novo PSD.
- Tratamento de erros e verificações automatizadas de lógica.

Validação no aplicativo Photoshop e na importação pelo After Effects pendente.
