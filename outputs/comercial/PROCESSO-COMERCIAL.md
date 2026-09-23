# Artboards 2 AE — Processo comercial

Responsável e identificação pública: **@mooshmassacre**.

Versão do processo: 1.0. Este documento operacionaliza a [licença](../LICENSE.md), sem substituí-la. As condições da licença prevalecem. Não acrescenta mensalidade, taxa de cadastro, pagamento mínimo ou percentual adicional.

**Canal oficial:** [gustavo@mooshmassacre.studio](mailto:gustavo@mooshmassacre.studio).

**Brasil:** Pix, em reais (BRL). **Clientes internacionais:** PayPal, na moeda expressamente acordada no cadastro. A chave Pix e o destino PayPal são enviados em privado; não presumir que o e-mail de atendimento seja uma chave Pix ou conta PayPal.

**Estado:** fluxo definido; antes de ativar cada cadastro, completar e conferir os dados privados de pagamento e contratação. Os modelos não ativam clientes automaticamente.

## 1. Condições comerciais

| Item | Regra |
| --- | --- |
| Cadastro | Uma vez por pessoa ou empresa licenciada; aprovação escrita antes do primeiro uso comercial. |
| Uso comum | Projetos para clientes, com receita identificável. Não exige nova autorização para cada trabalho dentro do escopo já aprovado. |
| Exceções | Campanhas próprias, uso interno sem receita segregada, pacotes inseparáveis e outras bases não identificáveis exigem acordo escrito antes do uso. |
| Preço | 10% do lucro de cada trabalho, conforme a licença. |
| Lucro | Receita efetivamente recebida menos custos diretos elegíveis e comprovados. |
| Prazo inicial | Demonstrativo e pagamento em até 30 dias corridos da conclusão do trabalho. |
| Parcelas posteriores | Atualizar o demonstrativo e pagar eventual complemento em até 30 dias de cada recebimento posterior à conclusão. |
| Sem lucro | Enviar demonstrativo, mesmo que o pagamento seja zero. |
| Créditos | Em cada trabalho, conforme a licença; não se exige marca d'água. |
| Uso e adaptação | Internos ao licenciado e sua equipe autorizada; sem redistribuição ou revenda do código. |
| Suporte | Canal de atendimento comercial não significa contrato de suporte, atualização ou garantia de prazo de resposta. |

Não cobrar multa, juros, reajuste ou despesas adicionais não previstos em acordo válido. A confirmação comercial deve distinguir o preço contratado do tratamento fiscal obrigatório.

## 2. Cadastro e autorização

1. O interessado envia o modelo de solicitação pelo e-mail gustavo@mooshmassacre.studio.
2. @mooshmassacre confere quem será o licenciado, o responsável pela contratação, o tipo de uso, país e moeda de recebimento dos trabalhos.
3. Para o cadastro inicial, pedir apenas identificação do licenciado, responsável, contato e escopo. Dados fiscais estritamente necessários à contratação ou emissão de documentos são solicitados em privado na etapa apropriada. Não pedir cópia de documento pessoal, PSD de cliente ou extratos bancários completos como rotina.
4. Atribuir um identificador, por exemplo `A2AE-C-0001`, e preparar a confirmação com moeda, beneficiário, meio de pagamento e tratamento de retenções obrigatórias. O nome público permanece @mooshmassacre; os dados contratuais/fiscais e do recebedor devem identificar corretamente a pessoa ou empresa responsável e ser fornecidos em privado.
5. Enviar a licença completa como anexo, com a confirmação preenchida. Identificar a revisão por commit ou hash do arquivo, além do nome da licença, para não depender de um link para `main` que pode mudar.
6. O interessado responde com aceite expresso da versão anexada e das condições da confirmação.
7. @mooshmassacre envia a ativação escrita e registra a data. Um pedido, pagamento avulso ou silêncio não ativa a autorização.
8. Entregar o JSX acompanhado de `LICENSE.md` e `LEIA-ME.md`. Informar o estado de validação real da versão entregue. O cadastro não obriga conceder acesso ao repositório privado.

O aceite por mensagem serve para manter registro do processo, mas o formato de contratação e a identificação das partes devem ser revistos juridicamente. Este processo não promete validade universal de um mecanismo de aceite.

## 3. Registro de cada trabalho

O licenciado mantém um código por trabalho, por exemplo `A2AE-C-0001-T-001`. Não precisa divulgar o nome do cliente final para enviar a apuração: um código e uma descrição suficientes bastam, sem prejuízo de comprovação necessária em caso de conferência.

Registrar: escopo, versão do Software utilizada, início, conclusão, receitas recebidas e respectivas datas, custos diretos, créditos utilizados e royalties pagos. A separação de entregas independentes deve estar documentada e precificada antes do uso; não pode ser criada depois apenas para reduzir a cobrança.

Trabalhos comuns não dependem de aprovação prévia individual. Trabalhos com base excepcional precisam do acordo específico previsto na licença. O controle por trabalho continua necessário mesmo quando o licenciado preferir agrupar vários demonstrativos em uma única mensagem ou transferência: isso não muda os vencimentos de cada um.

## 4. Apuração e cobrança

Para cada trabalho, sempre usar valores acumulados:

- `Lucro acumulado = máximo(0; receita recebida acumulada − custos diretos elegíveis acumulados)`.
- `Royalties acumulados = 10% × lucro acumulado`.
- `Complemento a pagar = máximo(0; royalties acumulados − royalties já pagos no mesmo trabalho)`.

Arredondar o resultado monetário final à menor unidade da moeda acordada (duas casas decimais para BRL). Não misturar moedas, nem compensar prejuízos ou pagamentos de um trabalho com outro. Se houver ajuste negativo, registrar a diferença e conciliá-la por escrito; não assumir estorno ou crédito automático.

Exemplo: um trabalho concluído recebeu R$ 6.000 e teve R$ 3.000 de custos elegíveis. O lucro inicial é R$ 3.000 e o royalty é R$ 300. Depois, entram outros R$ 4.000, sem novos custos. A receita acumulada passa a R$ 10.000, o lucro a R$ 7.000 e o royalty total a R$ 700. O complemento é R$ 400, descontando os R$ 300 já pagos.

Se o cliente ainda não pagou quando o trabalho termina, enviar o demonstrativo no prazo inicial, inclusive com zero recebido. Cada recebimento posterior reabre a apuração. Antecipações recebidas antes da conclusão entram no demonstrativo inicial.

@mooshmassacre confere o relatório e acusa recebimento. A conferência não prorroga o prazo contratual, nem cria uma segunda aprovação necessária para pagar: as instruções já devem constar da ativação. Divergências devem ser comunicadas e resolvidas por escrito.

Trabalho abandonado ou cancelado após uso da ferramenta, produto com vendas contínuas, devolução ao cliente ou mudança de escopo deve ser tratado por acordo escrito específico. Não presumir que esses eventos eliminam royalties sobre receita já recebida nem inventar um vencimento não previsto na licença.

## 5. Recebimento e confirmação

Pagamentos no Brasil são feitos por Pix em BRL. Para clientes internacionais, usar PayPal na moeda acordada no cadastro. Os dados concretos do beneficiário, a chave Pix e o destino PayPal são enviados exclusivamente no canal privado confirmado; não fazem parte deste repositório. Não cobrar automaticamente tarifas adicionais: moeda, conversão, tarifas e retenções devem estar claras na confirmação aceita.

Antes da ativação, preencher:

- Moeda de apuração e moeda de pagamento.
- Meio de pagamento e identificação correta do beneficiário.
- Dados de destino ou instruções para obtê-los por canal autenticado.
- Tratamento de retenções obrigatórias, comprovantes e eventuais tarifas.
- Para moedas diferentes, fonte da taxa de câmbio, data de referência e regra de conversão expressamente acordadas. Não escolher câmbio retroativamente.

Confirmar o crédito efetivo no banco ou provedor antes de dar baixa; a imagem de um comprovante, isoladamente, não comprova o recebimento. A mensagem de baixa deve indicar cadastro, trabalho, referência do demonstrativo, valor recebido, data e saldo daquela apuração. Evitar a expressão “quitação geral”: parcelas futuras podem gerar complementos.

A confirmação de recebimento não substitui documento fiscal que seja exigível. A emissão de documentos e as obrigações tributárias do titular devem ser definidas com apoio contábil conforme sua situação, sem prometer isenção ou tratamento fiscal neste manual.

## 6. Atrasos e encerramento

1. Identificar o demonstrativo ou pagamento faltante e enviar lembrete privado.
2. Se não regularizado, @mooshmassacre pode enviar notificação formal com prazo de 15 dias para corrigir um descumprimento sanável, conforme a licença. Registrar a comunicação e a data limite.
3. Só marcar a autorização como encerrada por falta de correção depois do prazo e da verificação do caso. Fraude, supressão intencional de créditos e redistribuição não autorizada seguem as disposições específicas da licença.
4. Registrar valores pendentes, inclusive recebimentos posteriores relacionados a trabalhos anteriores. Não divulgar devedores publicamente.

O procedimento é manual. Não há cobrança automática, lembretes agendados ou bloqueio remoto do JSX. Nada foi integrado a banco, checkout ou serviço de mensagens.

## 7. Controle e dados

Estados do cadastro: `Solicitado → Aguardando aceite → Ativo → Encerrado` ou `Recusado`. Usar um campo separado de pendências para não confundir atraso com encerramento automático.

Estados da apuração: `Aguardando demonstrativo → Recebido → Em conferência → A pagar → Pago nesta apuração`, ou `Sem valor devido` / `Em ajuste`. “Pago nesta apuração” não encerra o trabalho se houver recebimentos futuros.

Guardar registros preenchidos, aceites, dados fiscais e comprovantes em armazenamento privado com acesso restrito. Este repositório recebe somente modelos vazios e regras. A pasta `comercial-privado/` está ignorada pelo Git por conveniência, mas isso não é criptografia nem controle de acesso.

A licença exige que o licenciado conserve comprovantes por cinco anos após o último pagamento, ressalvados prazos obrigatórios maiores. Para os dados recebidos por @mooshmassacre, definir retenção de acordo com finalidade contratual e obrigações legais; não presumir retenção ilimitada. Informar aos cadastrados a finalidade de coleta e o canal de contato para solicitações sobre seus dados. Essa política específica permanece pendente de definição com os dados do responsável.

## 8. Pendências para operar

- Preparar instruções privadas completas: chave Pix, identificação do beneficiário e destino PayPal; testar o recebimento pelos meios escolhidos.
- Identificar corretamente as partes nos registros privados e definir os documentos fiscais aplicáveis.
- Revisar os instrumentos jurídicos e o aviso de tratamento de dados.
- Realizar um cadastro fictício de ponta a ponta antes do primeiro cadastro real.

## Referências de apoio

- [ANPD — glossário e princípio da necessidade](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/glossario-anpd): orientar a coleta ao mínimo necessário.
- [Banco Central — chaves Pix](https://www.bcb.gov.br/meubc/faqs/p/O-que-e-chave-pix): tipos de chave disponíveis, se Pix for adotado. Não é necessário publicar a chave no repositório.
