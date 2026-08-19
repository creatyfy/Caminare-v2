// AUTO-GERADO a partir dos documentos .docx de Termos de Uso e Política de
// Privacidade enviados pelo cliente. Não editar à mão — regenerar a partir
// dos documentos de origem.

export type LegalBlock = { t: 'h' | 'h2' | 'p' | 'li'; s: string };
export type LegalDoc = { title: string; updated: string; blocks: LegalBlock[] };
export type LegalKind = 'terms' | 'privacy';

// TERMS_VERSION mudou-se para src/app/content/termsVersion.ts para permitir
// que o AuthContext importe a versão sem carregar todo o conteúdo legal
// no bundle principal. Re-exportamos aqui só por compatibilidade.
export { TERMS_VERSION } from './termsVersion';

export const legalDocs: Record<LegalKind, Record<'pt-BR' | 'en', LegalDoc>> = {
  "terms": {
    "pt-BR": {
      "title": "Termos de Uso",
      "updated": "Última atualização: 03/08/2026",
      "blocks": [
        {
          "t": "p",
          "s": "Seja bem-vindo ao Caminare."
        },
        {
          "t": "p",
          "s": "O Caminare nasceu com intuito de ajudar as pessoas em sua jornada de autoconhecimento e nossa relação com nossos usuários é baseada em respeito e transparência. Para isso, buscamos deixar de forma clara, objetiva e acessível as regras que regem e orientam o uso da nossa plataforma."
        },
        {
          "t": "p",
          "s": "O Caminare é desenvolvido pela Calíope, empresa comprometida com atuação ética, conformidade regulatória, respeito à privacidade e proteção dos direitos de seus usuários."
        },
        {
          "t": "p",
          "s": "Sabemos que documentos jurídicos podem ser excessivamente complexos e de difícil compreensão. Entretanto, nossa intensão é que você compreenda claramente como a plataforma funciona, quais são seus direitos, quais são nossas responsabilidades e quais limites se aplicam ao uso do serviço."
        },
        {
          "t": "p",
          "s": "Para consultar detalhes sobre como seus dados e sua privacidade são tratados, consulte nossa política de privacidade."
        },
        {
          "t": "p",
          "s": "Estes Termos de Uso foram elaborados para estabelecer uma relação transparente, segura e juridicamente adequada entre você e o Caminare, em conformidade com a legislação aplicável e com respeito às boas práticas atuais de proteção ao consumidor e governança digital."
        },
        {
          "t": "p",
          "s": "Recomendamos a leitura integral deste documento antes da utilização da plataforma. Ao utilizar o Caminare, você declara ciência e concordância com as condições aqui previstas."
        },
        {
          "t": "p",
          "s": "Estes Termos de Uso (“Termos”) regulam o acesso e uso da plataforma digital Caminare (“Caminare”, “Plataforma” ou “Serviço”), disponibilizada por Calíope Sociedade Unipessoal Ltda., pessoa jurídica de direito privado, inscrita no CNPJ sob nº 13.769.065/0001-48, com sede na Av. Mal. Rondon, 700, Sala 512P, Jardim Chapadão, Campinas/SP, CEP 13070-173, doravante denominada “Calíope”, “nós” ou “Empresa”."
        },
        {
          "t": "p",
          "s": "Ao criar uma conta, acessar ou utilizar o Caminare, o usuário (“Usuário” ou “você”) declara ter lido, compreendido e concordado integralmente com estes Termos e com a Política de Privacidade aplicável."
        },
        {
          "t": "p",
          "s": "Caso não concorde com estes Termos, o Usuário não deverá acessar ou utilizar o Caminare."
        },
        {
          "t": "h",
          "s": "1. DEFINIÇÕES"
        },
        {
          "t": "p",
          "s": "Para fins destes Termos:"
        },
        {
          "t": "p",
          "s": "Conta: cadastro individual criado pelo Usuário para acesso ao Caminare."
        },
        {
          "t": "p",
          "s": "Conteúdo do Usuário: todo conteúdo inserido, enviado, registrado, validado, editado ou exportado pelo Usuário, incluindo textos, transcrições, registros, classificações, observações, emoções validadas, pensamentos identificados, crenças sugeridas e ajustadas, padrões validados e demais informações relacionadas ao uso da Plataforma."
        },
        {
          "t": "p",
          "s": "IA: sistemas de inteligência artificial utilizados pelo Caminare, próprios ou de terceiros, para processamento, organização, categorização, transcrição e geração de sugestões relacionadas ao funcionamento da Plataforma."
        },
        {
          "t": "p",
          "s": "Serviços de Terceiros: provedores externos utilizados para funcionamento da Plataforma, incluindo infraestrutura tecnológica, autenticação, analytics, processamento de pagamentos, inteligência artificial, armazenamento e serviços correlatos."
        },
        {
          "t": "h",
          "s": "2. NATUREZA DO CAMINARE"
        },
        {
          "t": "p",
          "s": "O Caminare é uma ferramenta digital de autoconhecimento e organização de registros pessoais com apoio de inteligência artificial, destinada a auxiliar o Usuário na organização e visualização de registros pessoais e percepções subjetivas."
        },
        {
          "t": "p",
          "s": "O Caminare poderá oferecer funcionalidades como:"
        },
        {
          "t": "li",
          "s": "registro de textos livres"
        },
        {
          "t": "li",
          "s": "registro por áudio com transcrição automatizada"
        },
        {
          "t": "li",
          "s": "identificação algorítmica de emoções"
        },
        {
          "t": "li",
          "s": "identificação algorítmica de pensamentos"
        },
        {
          "t": "li",
          "s": "sugestão de crenças subjacentes"
        },
        {
          "t": "li",
          "s": "identificação de padrões recorrentes"
        },
        {
          "t": "li",
          "s": "histórico de registros"
        },
        {
          "t": "li",
          "s": "exportação de conteúdo"
        },
        {
          "t": "li",
          "s": "lembretes e funcionalidades correlatas"
        },
        {
          "t": "p",
          "s": "O Usuário reconhece que a Plataforma utiliza sistemas automatizados para apoiar a organização e estruturação de informações, podendo haver erros, imprecisões, inconsistências ou classificações inadequadas."
        },
        {
          "t": "h",
          "s": "3. LIMITAÇÕES ESSENCIAIS DO SERVIÇO"
        },
        {
          "t": "p",
          "s": "O Caminare não constitui serviço de saúde, assistência médica, psicologia, psiquiatria, psicoterapia ou qualquer atividade clínica, assistencial ou terapêutica."
        },
        {
          "t": "p",
          "s": "O Caminare:"
        },
        {
          "t": "li",
          "s": "não realiza diagnóstico"
        },
        {
          "t": "li",
          "s": "não realiza avaliação clínica"
        },
        {
          "t": "li",
          "s": "não realiza triagem médica ou psicológica"
        },
        {
          "t": "li",
          "s": "não presta atendimento emergencial"
        },
        {
          "t": "li",
          "s": "não monitora crises"
        },
        {
          "t": "li",
          "s": "não detecta risco clínico"
        },
        {
          "t": "li",
          "s": "não substitui profissionais de saúde"
        },
        {
          "t": "li",
          "s": "não oferece acompanhamento terapêutico"
        },
        {
          "t": "li",
          "s": "não aciona familiares, autoridades ou serviços de emergência"
        },
        {
          "t": "li",
          "s": "não garante detecção de situações críticas ou de risco"
        },
        {
          "t": "p",
          "s": "As informações, classificações, inferências ou sugestões apresentadas pela Plataforma possuem finalidade exclusivamente informacional e organizacional, voltada ao autoconhecimento pessoal."
        },
        {
          "t": "p",
          "s": "O Usuário é integralmente responsável por suas próprias decisões, interpretações e condutas."
        },
        {
          "t": "p",
          "s": "Se o Usuário estiver vivenciando emergência, crise, risco pessoal ou necessidade de suporte profissional, deverá buscar imediatamente atendimento apropriado local."
        },
        {
          "t": "h",
          "s": "4. ELEGIBILIDADE"
        },
        {
          "t": "p",
          "s": "O uso do Caminare é restrito a pessoas com 18 (dezoito) anos ou mais, plenamente capazes para celebrar contratos juridicamente vinculantes."
        },
        {
          "t": "p",
          "s": "Ao utilizar a Plataforma, o Usuário declara e garante que:"
        },
        {
          "t": "li",
          "s": "possui pelo menos 18 anos de idade"
        },
        {
          "t": "li",
          "s": "possui capacidade legal para aceitar estes Termos"
        },
        {
          "t": "li",
          "s": "fornecerá informações verdadeiras, completas e atualizadas"
        },
        {
          "t": "li",
          "s": "utilizará a Plataforma em conformidade com a legislação aplicável"
        },
        {
          "t": "p",
          "s": "O uso por menores de idade é expressamente proibido."
        },
        {
          "t": "p",
          "s": "Caso identifiquemos uso indevido por menor, a Conta poderá ser suspensa ou encerrada, sem prejuízo das medidas cabíveis."
        },
        {
          "t": "h",
          "s": "5. CADASTRO E CONTA"
        },
        {
          "t": "p",
          "s": "Para utilizar determinadas funcionalidades, o Usuário deverá criar uma Conta."
        },
        {
          "t": "p",
          "s": "O cadastro poderá ocorrer por:"
        },
        {
          "t": "li",
          "s": "e-mail e senha"
        },
        {
          "t": "li",
          "s": "autenticação via Google"
        },
        {
          "t": "li",
          "s": "autenticação via Apple"
        },
        {
          "t": "li",
          "s": "outros métodos eventualmente disponibilizados"
        },
        {
          "t": "p",
          "s": "O Usuário compromete-se a:"
        },
        {
          "t": "li",
          "s": "fornecer informações corretas"
        },
        {
          "t": "li",
          "s": "manter seus dados atualizados"
        },
        {
          "t": "li",
          "s": "proteger suas credenciais"
        },
        {
          "t": "li",
          "s": "não compartilhar acesso com terceiros"
        },
        {
          "t": "li",
          "s": "não permitir uso indevido de sua Conta"
        },
        {
          "t": "p",
          "s": "A Conta é:"
        },
        {
          "t": "li",
          "s": "pessoal"
        },
        {
          "t": "li",
          "s": "individual"
        },
        {
          "t": "li",
          "s": "intransferível"
        },
        {
          "t": "li",
          "s": "não sublicenciável"
        },
        {
          "t": "p",
          "s": "O Usuário é responsável por toda atividade realizada por meio de sua Conta, salvo comprovado acesso não autorizado sem sua culpa."
        },
        {
          "t": "p",
          "s": "Se houver comprometimento de credenciais ou suspeita de acesso indevido, o Usuário deverá comunicar imediatamente a Empresa."
        },
        {
          "t": "p",
          "s": "Contas autenticadas por provedores terceiros poderão estar sujeitas às regras desses provedores."
        },
        {
          "t": "p",
          "s": "A indisponibilidade de login social não impede, quando tecnicamente disponível, mecanismos alternativos razoáveis de recuperação de acesso."
        },
        {
          "t": "h",
          "s": "6. CONTAS INATIVAS"
        },
        {
          "t": "p",
          "s": "Contas sem atividade por período igual ou superior a 24 (vinte e quatro) meses consecutivos poderão ser desativadas ou encerradas pela Empresa."
        },
        {
          "t": "p",
          "s": "Sempre que razoavelmente possível, poderá ser enviado aviso prévio ao Usuário."
        },
        {
          "t": "p",
          "s": "A eventual retenção ou exclusão de dados seguirá a Política de Privacidade aplicável."
        },
        {
          "t": "h",
          "s": "7. PERÍODO GRATUITO (TRIAL)"
        },
        {
          "t": "p",
          "s": "A Empresa poderá disponibilizar período promocional gratuito de uso (“Trial”), atualmente previsto em até 15 (quinze) dias, conforme condições vigentes no momento da contratação."
        },
        {
          "t": "p",
          "s": "O Trial:"
        },
        {
          "t": "li",
          "s": "poderá ser alterado, suspenso ou descontinuado a qualquer momento"
        },
        {
          "t": "li",
          "s": "poderá estar sujeito a elegibilidade"
        },
        {
          "t": "li",
          "s": "poderá ser limitado a novos usuários"
        },
        {
          "t": "p",
          "s": "Ao término do período gratuito, o acesso às funcionalidades pagas poderá expirar automaticamente, cabendo ao Usuário optar voluntariamente pela contratação de plano pago."
        },
        {
          "t": "p",
          "s": "O término do Trial não gera renovação automática paga sem contratação correspondente conforme fluxo da plataforma aplicável."
        },
        {
          "t": "h",
          "s": "8. ASSINATURAS, PAGAMENTOS E CANCELAMENTO"
        },
        {
          "t": "p",
          "s": "O Caminare poderá disponibilizar diferentes modalidades de planos, gratuitos e pagos, com características, funcionalidades, limites de utilização, quantidade máxima de registros, preços e demais condições comerciais distintas, conforme apresentadas na plataforma, na página oficial de planos do Caminare e durante o processo de contratação da assinatura. Os planos disponíveis poderão incluir, exemplificativamente:"
        },
        {
          "t": "li",
          "s": "plano mensal"
        },
        {
          "t": "li",
          "s": "plano anual"
        },
        {
          "t": "li",
          "s": "ofertas promocionais específicas"
        },
        {
          "t": "p",
          "s": "Preços, moeda, promoções e condições comerciais poderão variar conforme:"
        },
        {
          "t": "li",
          "s": "país"
        },
        {
          "t": "li",
          "s": "loja de aplicativos"
        },
        {
          "t": "li",
          "s": "campanha promocional"
        },
        {
          "t": "li",
          "s": "momento da contratação"
        },
        {
          "t": "p",
          "s": "As assinaturas contratadas via Apple App Store ou Google Play Store estarão sujeitas, adicionalmente, às políticas e regras dessas plataformas."
        },
        {
          "t": "h2",
          "s": "8.1 Renovação automática"
        },
        {
          "t": "p",
          "s": "Salvo indicação diversa no fluxo de contratação, assinaturas recorrentes serão renovadas automaticamente ao término de cada ciclo correspondente."
        },
        {
          "t": "p",
          "s": "Ao contratar assinatura recorrente, o Usuário autoriza a cobrança recorrente aplicável pela plataforma de pagamento correspondente."
        },
        {
          "t": "h2",
          "s": "8.2 Cancelamento"
        },
        {
          "t": "p",
          "s": "O Usuário poderá cancelar a renovação automática a qualquer momento pelos meios disponibilizados pela plataforma aplicável."
        },
        {
          "t": "p",
          "s": "O cancelamento:"
        },
        {
          "t": "li",
          "s": "interrompe futuras renovações"
        },
        {
          "t": "li",
          "s": "não implica reembolso automático de período já contratado"
        },
        {
          "t": "li",
          "s": "preserva o acesso até o encerramento do ciclo pago vigente, salvo disposição legal obrigatória diversa"
        },
        {
          "t": "h2",
          "s": "8.3 Reembolsos"
        },
        {
          "t": "p",
          "s": "Reembolsos observarão:"
        },
        {
          "t": "li",
          "s": "legislação aplicável"
        },
        {
          "t": "li",
          "s": "regras obrigatórias das lojas de aplicativos"
        },
        {
          "t": "li",
          "s": "políticas da plataforma de pagamento correspondente"
        },
        {
          "t": "p",
          "s": "Nos casos aplicáveis de direito de arrependimento ou obrigação legal equivalente, a Empresa observará a legislação obrigatória incidente."
        },
        {
          "t": "h2",
          "s": "8.4 Limites de Uso"
        },
        {
          "t": "p",
          "s": "Cada plano poderá estabelecer limites operacionais, incluindo, entre outros, quantidade máxima de registros que poderão ser criados durante cada ciclo de cobrança."
        },
        {
          "t": "p",
          "s": "Esses limites serão informados na Plataforma no momento da contratação e poderão variar conforme o plano escolhido."
        },
        {
          "t": "p",
          "s": "Após atingir o limite aplicável, o Usuário poderá continuar acessando seu conteúdo já existente, mas poderá ficar impedido de criar novos registros até:"
        },
        {
          "t": "li",
          "s": "o início de novo ciclo"
        },
        {
          "t": "li",
          "s": "a contratação de plano compatível"
        },
        {
          "t": "li",
          "s": "ou outra forma de ampliação de capacidade eventualmente disponibilizada pela Empresa"
        },
        {
          "t": "h2",
          "s": "8.5 Alterações dos planos e condições comerciais"
        },
        {
          "t": "p",
          "s": "A Empresa poderá criar, alterar, substituir ou descontinuar planos, funcionalidades, limites de utilização, preços e demais condições comerciais a qualquer momento, observada a legislação aplicável."
        },
        {
          "t": "p",
          "s": "Tais alterações não afetarão assinaturas já contratadas durante o respectivo ciclo de cobrança, salvo quando permitido pela legislação aplicável ou mediante comunicação prévia ao usuário, quando exigida."
        },
        {
          "t": "p",
          "s": "Os planos disponíveis, respectivos preços, limites de utilização, funcionalidades e demais condições comerciais encontram-se disponíveis na Plataforma, na página oficial de planos do Caminare (https://caminare.com.br/planos) e/ou no fluxo de contratação da loja de aplicativos correspondente. Em caso de divergência, prevalecerão as informações apresentadas ao Usuário no momento da contratação da assinatura."
        },
        {
          "t": "h",
          "s": "9. USO PERMITIDO E RESTRIÇÕES DE USO"
        },
        {
          "t": "p",
          "s": "O Caminare é disponibilizado exclusivamente para uso pessoal, individual e lícito, dentro das finalidades previstas nestes Termos."
        },
        {
          "t": "p",
          "s": "O Usuário concorda em utilizar a Plataforma de forma compatível com sua finalidade de organização pessoal, autoconhecimento e registro individual."
        },
        {
          "t": "p",
          "s": "É expressamente proibido:"
        },
        {
          "t": "li",
          "s": "utilizar a Plataforma para fins ilícitos, fraudulentos ou contrários à legislação aplicável"
        },
        {
          "t": "li",
          "s": "inserir, processar ou compartilhar dados pessoais de terceiros sem base jurídica, autorização ou legitimidade adequada"
        },
        {
          "t": "li",
          "s": "utilizar a Plataforma para assédio, fraude, falsidade ideológica, impersonation ou qualquer conduta abusiva"
        },
        {
          "t": "li",
          "s": "tentar acessar contas, sistemas, dados ou ambientes sem autorização"
        },
        {
          "t": "li",
          "s": "contornar, interferir, comprometer ou tentar comprometer mecanismos de autenticação, segurança ou proteção da Plataforma"
        },
        {
          "t": "li",
          "s": "realizar scraping, crawling, harvesting, mineração automatizada ou extração sistemática de dados"
        },
        {
          "t": "li",
          "s": "utilizar bots, scripts, automações abusivas ou qualquer mecanismo automatizado não autorizado"
        },
        {
          "t": "li",
          "s": "realizar engenharia reversa, descompilação, desmontagem, replicação, benchmarking técnico indevido ou tentativa de descoberta de arquitetura, prompts, fluxos internos ou metodologias proprietárias"
        },
        {
          "t": "li",
          "s": "inserir malware, código malicioso, arquivos corrompidos ou qualquer elemento que comprometa a Plataforma"
        },
        {
          "t": "li",
          "s": "utilizar o Caminare como backend, infraestrutura ou serviço para terceiros"
        },
        {
          "t": "li",
          "s": "revender, sublicenciar, redistribuir ou explorar comercialmente a Plataforma sem autorização expressa"
        },
        {
          "t": "li",
          "s": "utilizar a Plataforma de modo incompatível com sua finalidade"
        },
        {
          "t": "li",
          "s": "interferir no funcionamento normal do Serviço"
        },
        {
          "t": "li",
          "s": "testar vulnerabilidades sem autorização formal da Empresa"
        },
        {
          "t": "p",
          "s": "A violação destas restrições poderá resultar em suspensão, bloqueio, encerramento da Conta, medidas técnicas, medidas administrativas e providências legais cabíveis."
        },
        {
          "t": "h",
          "s": "10. CONTEÚDO DO USUÁRIO"
        },
        {
          "t": "p",
          "s": "O Usuário poderá inserir, registrar, validar, editar, exportar e organizar conteúdo próprio por meio da Plataforma."
        },
        {
          "t": "p",
          "s": "O Usuário declara e garante que:"
        },
        {
          "t": "li",
          "s": "possui legitimidade para inserir o conteúdo enviado"
        },
        {
          "t": "li",
          "s": "não viola direitos de terceiros"
        },
        {
          "t": "li",
          "s": "não utilizará a Plataforma para tratamento indevido de dados de terceiros"
        },
        {
          "t": "li",
          "s": "é responsável pela legalidade do conteúdo que inserir"
        },
        {
          "t": "li",
          "s": "é responsável pelas consequências do uso, exportação ou compartilhamento do conteúdo"
        },
        {
          "t": "p",
          "s": "A titularidade do Conteúdo do Usuário permanece com o próprio Usuário."
        },
        {
          "t": "h2",
          "s": "10.1 Licença operacional"
        },
        {
          "t": "p",
          "s": "Para viabilizar o funcionamento da Plataforma, o Usuário concede à Empresa licença não exclusiva, mundial, limitada, revogável na medida permitida pela operacionalização do serviço, para:"
        },
        {
          "t": "li",
          "s": "armazenar"
        },
        {
          "t": "li",
          "s": "processar"
        },
        {
          "t": "li",
          "s": "organizar"
        },
        {
          "t": "li",
          "s": "transcrever"
        },
        {
          "t": "li",
          "s": "classificar"
        },
        {
          "t": "li",
          "s": "estruturar"
        },
        {
          "t": "li",
          "s": "exibir"
        },
        {
          "t": "li",
          "s": "exportar"
        },
        {
          "t": "li",
          "s": "transmitir tecnicamente"
        },
        {
          "t": "li",
          "s": "tratar operacionalmente"
        },
        {
          "t": "p",
          "s": "o Conteúdo do Usuário exclusivamente para:"
        },
        {
          "t": "li",
          "s": "prestação do Serviço"
        },
        {
          "t": "li",
          "s": "execução das funcionalidades contratadas"
        },
        {
          "t": "li",
          "s": "suporte técnico"
        },
        {
          "t": "li",
          "s": "segurança operacional"
        },
        {
          "t": "li",
          "s": "analytics"
        },
        {
          "t": "li",
          "s": "melhoria da Plataforma"
        },
        {
          "t": "li",
          "s": "aprimoramento tecnológico"
        },
        {
          "t": "li",
          "s": "desenvolvimento de melhorias internas"
        },
        {
          "t": "p",
          "s": "Dados anonimizados e agregados poderão ser utilizados para analytics, melhoria tecnológica, desenvolvimento de produto e aprimoramento de modelos, sem identificação individual do Usuário."
        },
        {
          "t": "p",
          "s": "Dados identificáveis do Usuário não serão utilizados para treinamento de modelos de inteligência artificial para finalidades de aprimoramento geral."
        },
        {
          "t": "h2",
          "s": "10.2 Compartilhamento pelo Usuário"
        },
        {
          "t": "p",
          "s": "A Plataforma poderá disponibilizar funcionalidades de exportação ou compartilhamento de conteúdo, incluindo PDF e cópia textual."
        },
        {
          "t": "p",
          "s": "Qualquer compartilhamento realizado pelo Usuário com terceiros ocorrerá sob sua exclusiva responsabilidade."
        },
        {
          "t": "p",
          "s": "A Empresa não se responsabiliza pelo uso, tratamento, armazenamento, redistribuição ou exposição de conteúdo após compartilhamento voluntário realizado pelo próprio Usuário."
        },
        {
          "t": "h2",
          "s": "10.3 Feedback"
        },
        {
          "t": "p",
          "s": "Sugestões, comentários, ideias, propostas de melhoria, críticas ou feedback encaminhados pelo Usuário poderão ser utilizados livremente pela Empresa, sem obrigação de compensação, reconhecimento, confidencialidade ou restrição de uso, salvo disposição legal obrigatória diversa."
        },
        {
          "t": "h",
          "s": "11. INTELIGÊNCIA ARTIFICIAL E LIMITAÇÕES DOS OUTPUTS"
        },
        {
          "t": "p",
          "s": "O Caminare utiliza sistemas de inteligência artificial próprios e/ou de terceiros como componente central de funcionamento da Plataforma."
        },
        {
          "t": "p",
          "s": "Esses sistemas podem ser utilizados, entre outras finalidades, para:"
        },
        {
          "t": "li",
          "s": "transcrição de áudio"
        },
        {
          "t": "li",
          "s": "identificação de emoções"
        },
        {
          "t": "li",
          "s": "organização de registros"
        },
        {
          "t": "li",
          "s": "identificação de pensamentos"
        },
        {
          "t": "li",
          "s": "sugestão de crenças subjacentes"
        },
        {
          "t": "li",
          "s": "identificação de padrões"
        },
        {
          "t": "li",
          "s": "estruturação de informações"
        },
        {
          "t": "li",
          "s": "apoio à navegação e experiência da Plataforma"
        },
        {
          "t": "p",
          "s": "O Usuário reconhece e aceita que sistemas de IA:"
        },
        {
          "t": "li",
          "s": "podem gerar erros"
        },
        {
          "t": "li",
          "s": "podem apresentar imprecisões"
        },
        {
          "t": "li",
          "s": "podem produzir classificações inadequadas"
        },
        {
          "t": "li",
          "s": "podem apresentar inconsistências"
        },
        {
          "t": "li",
          "s": "podem falhar"
        },
        {
          "t": "li",
          "s": "não possuem compreensão humana"
        },
        {
          "t": "li",
          "s": "operam com modelos probabilísticos"
        },
        {
          "t": "li",
          "s": "dependem da qualidade dos dados fornecidos"
        },
        {
          "t": "p",
          "s": "As sugestões geradas pela Plataforma:"
        },
        {
          "t": "li",
          "s": "não constituem verdade factual"
        },
        {
          "t": "li",
          "s": "não constituem orientação profissional"
        },
        {
          "t": "li",
          "s": "não constituem aconselhamento médico, psicológico, terapêutico, jurídico ou financeiro"
        },
        {
          "t": "li",
          "s": "não substituem avaliação humana"
        },
        {
          "t": "p",
          "s": "O Usuário permanece integralmente responsável por validar, interpretar, aceitar, rejeitar ou ignorar sugestões apresentadas."
        },
        {
          "t": "p",
          "s": "A Empresa não garante exatidão absoluta, completude, adequação subjetiva ou adequação individual dos outputs gerados."
        },
        {
          "t": "h",
          "s": "12. DISPONIBILIDADE, MANUTENÇÃO E SUPORTE"
        },
        {
          "t": "p",
          "s": "A Empresa buscará manter a Plataforma operacional com esforços comercialmente razoáveis, mas não garante disponibilidade contínua, ininterrupta, livre de falhas ou permanentemente acessível."
        },
        {
          "t": "p",
          "s": "O Serviço poderá sofrer interrupções temporárias por motivos como:"
        },
        {
          "t": "li",
          "s": "manutenção programada"
        },
        {
          "t": "li",
          "s": "manutenção emergencial"
        },
        {
          "t": "li",
          "s": "correções técnicas"
        },
        {
          "t": "li",
          "s": "atualizações"
        },
        {
          "t": "li",
          "s": "mudanças de infraestrutura"
        },
        {
          "t": "li",
          "s": "falhas técnicas"
        },
        {
          "t": "li",
          "s": "bugs"
        },
        {
          "t": "li",
          "s": "indisponibilidade de terceiros"
        },
        {
          "t": "li",
          "s": "falhas de provedores externos"
        },
        {
          "t": "li",
          "s": "indisponibilidade de serviços de IA"
        },
        {
          "t": "li",
          "s": "ataques cibernéticos"
        },
        {
          "t": "li",
          "s": "eventos de força maior"
        },
        {
          "t": "li",
          "s": "falhas de conectividade"
        },
        {
          "t": "li",
          "s": "incompatibilidades técnicas do dispositivo do Usuário"
        },
        {
          "t": "p",
          "s": "A Empresa poderá alterar, atualizar, corrigir, suspender, limitar ou modificar funcionalidades a qualquer momento, temporária ou permanentemente."
        },
        {
          "t": "p",
          "s": "Sempre que razoavelmente possível, manutenções programadas relevantes poderão ser comunicadas previamente."
        },
        {
          "t": "h2",
          "s": "12.1 Serviços de terceiros"
        },
        {
          "t": "p",
          "s": "O funcionamento da Plataforma depende de serviços externos, incluindo infraestrutura, autenticação, analytics, pagamentos e provedores tecnológicos."
        },
        {
          "t": "p",
          "s": "A Empresa não se responsabiliza por indisponibilidades exclusivamente decorrentes de terceiros fora de seu controle razoável."
        },
        {
          "t": "h2",
          "s": "12.2 Suporte"
        },
        {
          "t": "p",
          "s": "O suporte operacional poderá ser prestado pelos canais oficialmente disponibilizados pela Empresa."
        },
        {
          "t": "p",
          "s": "A Empresa não garante tempo específico de resposta, SLA contratual ou resolução dentro de prazo fixo, salvo obrigação legal aplicável."
        },
        {
          "t": "h",
          "s": "13. PROPRIEDADE INTELECTUAL"
        },
        {
          "t": "p",
          "s": "Todos os direitos relacionados ao Caminare pertencem à Empresa ou a seus licenciantes, conforme aplicável."
        },
        {
          "t": "p",
          "s": "Incluem-se, sem limitação:"
        },
        {
          "t": "li",
          "s": "marca Caminare"
        },
        {
          "t": "li",
          "s": "identidade visual"
        },
        {
          "t": "li",
          "s": "interface"
        },
        {
          "t": "li",
          "s": "layout"
        },
        {
          "t": "li",
          "s": "design"
        },
        {
          "t": "li",
          "s": "experiência de usuário"
        },
        {
          "t": "li",
          "s": "software"
        },
        {
          "t": "li",
          "s": "código-fonte"
        },
        {
          "t": "li",
          "s": "arquitetura tecnológica"
        },
        {
          "t": "li",
          "s": "prompts"
        },
        {
          "t": "li",
          "s": "fluxos internos"
        },
        {
          "t": "li",
          "s": "metodologia"
        },
        {
          "t": "li",
          "s": "taxonomias"
        },
        {
          "t": "li",
          "s": "classificações proprietárias"
        },
        {
          "t": "li",
          "s": "bancos de dados"
        },
        {
          "t": "li",
          "s": "documentação"
        },
        {
          "t": "li",
          "s": "materiais institucionais"
        },
        {
          "t": "li",
          "s": "funcionalidades"
        },
        {
          "t": "li",
          "s": "conteúdos produzidos pela Empresa"
        },
        {
          "t": "p",
          "s": "Estes Termos não transferem ao Usuário qualquer direito de propriedade intelectual, exceto licença limitada de uso pessoal da Plataforma."
        },
        {
          "t": "p",
          "s": "É vedado ao Usuário:"
        },
        {
          "t": "li",
          "s": "copiar"
        },
        {
          "t": "li",
          "s": "reproduzir"
        },
        {
          "t": "li",
          "s": "redistribuir"
        },
        {
          "t": "li",
          "s": "adaptar"
        },
        {
          "t": "li",
          "s": "modificar"
        },
        {
          "t": "li",
          "s": "desmontar"
        },
        {
          "t": "li",
          "s": "descompilar"
        },
        {
          "t": "li",
          "s": "criar obras derivadas"
        },
        {
          "t": "li",
          "s": "replicar funcionalidades"
        },
        {
          "t": "li",
          "s": "explorar economicamente"
        },
        {
          "t": "li",
          "s": "sublicenciar"
        },
        {
          "t": "li",
          "s": "comercializar"
        },
        {
          "t": "li",
          "s": "qualquer elemento protegido da Plataforma sem autorização expressa"
        },
        {
          "t": "h",
          "s": "14. SUSPENSÃO, RESTRIÇÃO E ENCERRAMENTO DE CONTA"
        },
        {
          "t": "p",
          "s": "A Empresa poderá, a seu critério razoável, suspender, restringir, limitar ou encerrar total ou parcialmente o acesso do Usuário à Plataforma, temporária ou definitivamente, inclusive sem aviso prévio quando necessário, caso identifique ou razoavelmente suspeite de:"
        },
        {
          "t": "li",
          "s": "violação destes Termos"
        },
        {
          "t": "li",
          "s": "uso ilícito ou abusivo"
        },
        {
          "t": "li",
          "s": "fraude ou tentativa de fraude"
        },
        {
          "t": "li",
          "s": "inserção indevida de dados de terceiros"
        },
        {
          "t": "li",
          "s": "comprometimento de segurança"
        },
        {
          "t": "li",
          "s": "uso automatizado não autorizado"
        },
        {
          "t": "li",
          "s": "engenharia reversa"
        },
        {
          "t": "li",
          "s": "tentativa de exploração técnica indevida"
        },
        {
          "t": "li",
          "s": "inadimplência aplicável"
        },
        {
          "t": "li",
          "s": "determinação judicial, regulatória ou legal"
        },
        {
          "t": "li",
          "s": "risco operacional, jurídico ou reputacional relevante"
        },
        {
          "t": "li",
          "s": "comportamento que comprometa a integridade da Plataforma ou de terceiros"
        },
        {
          "t": "p",
          "s": "A adoção dessas medidas poderá ocorrer para proteção:"
        },
        {
          "t": "li",
          "s": "da Empresa"
        },
        {
          "t": "li",
          "s": "da Plataforma"
        },
        {
          "t": "li",
          "s": "de usuários"
        },
        {
          "t": "li",
          "s": "de terceiros"
        },
        {
          "t": "li",
          "s": "de infraestrutura tecnológica"
        },
        {
          "t": "li",
          "s": "do cumprimento regulatório aplicável"
        },
        {
          "t": "p",
          "s": "Sempre que razoavelmente possível e compatível com segurança, a Empresa poderá comunicar o Usuário previamente ou posteriormente."
        },
        {
          "t": "p",
          "s": "Encerramento pelo Usuário"
        },
        {
          "t": "p",
          "s": "O Usuário poderá encerrar sua Conta a qualquer momento pelos meios disponibilizados pela Plataforma."
        },
        {
          "t": "p",
          "s": "O encerramento da Conta:"
        },
        {
          "t": "li",
          "s": "não elimina automaticamente obrigações já constituídas"
        },
        {
          "t": "li",
          "s": "não gera reembolso automático, salvo previsão legal obrigatória"
        },
        {
          "t": "li",
          "s": "observará as regras de retenção e exclusão previstas na Política de Privacidade"
        },
        {
          "t": "h",
          "s": "15. LIMITAÇÃO DE RESPONSABILIDADE"
        },
        {
          "t": "p",
          "s": "Na máxima extensão permitida pela legislação aplicável, a Empresa não será responsável por danos decorrentes de circunstâncias fora de seu controle razoável ou de uso inadequado da Plataforma."
        },
        {
          "t": "p",
          "s": "Sem prejuízo dos direitos legalmente irrenunciáveis do consumidor, a Empresa não garante que:"
        },
        {
          "t": "li",
          "s": "a Plataforma funcionará sem interrupções"
        },
        {
          "t": "li",
          "s": "a Plataforma estará livre de bugs"
        },
        {
          "t": "li",
          "s": "a Plataforma estará permanentemente disponível"
        },
        {
          "t": "li",
          "s": "os outputs da IA serão corretos"
        },
        {
          "t": "li",
          "s": "classificações serão precisas"
        },
        {
          "t": "li",
          "s": "sugestões refletirão adequadamente a realidade subjetiva do Usuário"
        },
        {
          "t": "li",
          "s": "a Plataforma atenderá expectativas individuais específicas"
        },
        {
          "t": "p",
          "s": "O Usuário reconhece que utiliza a Plataforma por sua própria conta e risco compatível com a natureza do Serviço."
        },
        {
          "t": "p",
          "s": "A Empresa não se responsabiliza por:"
        },
        {
          "t": "h2",
          "s": "15.1 Decisões pessoais do Usuário"
        },
        {
          "t": "p",
          "s": "Qualquer decisão, interpretação, conduta, ação ou omissão tomada com base em outputs, classificações, sugestões, inferências ou informações exibidas pela Plataforma."
        },
        {
          "t": "h2",
          "s": "15.2 Uso indevido"
        },
        {
          "t": "p",
          "s": "Uso contrário aos Termos, à legislação aplicável ou à finalidade do Serviço."
        },
        {
          "t": "h2",
          "s": "15.3 Dados inseridos pelo Usuário"
        },
        {
          "t": "p",
          "s": "Conteúdo incorreto, incompleto, impreciso, enganoso, inadequado ou inserido sem legitimidade."
        },
        {
          "t": "h2",
          "s": "15.4 Serviços de terceiros"
        },
        {
          "t": "p",
          "s": "Falhas, indisponibilidades, interrupções, limitações ou condutas relacionadas a terceiros, incluindo:"
        },
        {
          "t": "li",
          "s": "provedores de IA"
        },
        {
          "t": "li",
          "s": "serviços cloud"
        },
        {
          "t": "li",
          "s": "gateways de pagamento"
        },
        {
          "t": "li",
          "s": "Apple"
        },
        {
          "t": "li",
          "s": "Google"
        },
        {
          "t": "li",
          "s": "provedores de autenticação"
        },
        {
          "t": "li",
          "s": "analytics"
        },
        {
          "t": "li",
          "s": "telecomunicações"
        },
        {
          "t": "li",
          "s": "internet do Usuário"
        },
        {
          "t": "h2",
          "s": "15.5 Compartilhamento voluntário"
        },
        {
          "t": "p",
          "s": "Qualquer consequência decorrente de exportação ou compartilhamento voluntário realizado pelo próprio Usuário."
        },
        {
          "t": "h2",
          "s": "15.6 Segurança fora de controle razoável"
        },
        {
          "t": "p",
          "s": "Ataques cibernéticos, fraudes externas, falhas sistêmicas, força maior ou eventos equivalentes fora do controle razoável da Empresa."
        },
        {
          "t": "h2",
          "s": "15.7 Limitação essencial do produto"
        },
        {
          "t": "p",
          "s": "O Caminare é ferramenta de autoconhecimento e organização pessoal."
        },
        {
          "t": "p",
          "s": "Não deve ser utilizado como:"
        },
        {
          "t": "li",
          "s": "ferramenta de resposta emergencial"
        },
        {
          "t": "li",
          "s": "serviço clínico"
        },
        {
          "t": "li",
          "s": "substituto de terapia"
        },
        {
          "t": "li",
          "s": "monitoramento de risco"
        },
        {
          "t": "li",
          "s": "mecanismo de intervenção em crise"
        },
        {
          "t": "li",
          "s": "sistema de tomada de decisão profissional"
        },
        {
          "t": "p",
          "s": "Nada na Plataforma constitui aconselhamento profissional."
        },
        {
          "t": "h",
          "s": "16. PRIVACIDADE E TRATAMENTO DE DADOS"
        },
        {
          "t": "p",
          "s": "O tratamento de dados pessoais realizado no contexto do Caminare é regido pela Política de Privacidade, documento separado e complementar a estes Termos."
        },
        {
          "t": "p",
          "s": "Ao utilizar a Plataforma, o Usuário declara ciência de que determinados dados poderão ser tratados conforme descrito na Política de Privacidade, incluindo, conforme aplicável:"
        },
        {
          "t": "li",
          "s": "dados cadastrais"
        },
        {
          "t": "li",
          "s": "dados técnicos"
        },
        {
          "t": "li",
          "s": "dados de uso"
        },
        {
          "t": "li",
          "s": "registros inseridos pelo Usuário"
        },
        {
          "t": "li",
          "s": "transcrições"
        },
        {
          "t": "li",
          "s": "inferências operacionais"
        },
        {
          "t": "li",
          "s": "analytics"
        },
        {
          "t": "li",
          "s": "dados necessários à execução do Serviço"
        },
        {
          "t": "p",
          "s": "O Usuário reconhece que o funcionamento da Plataforma poderá envolver:"
        },
        {
          "t": "li",
          "s": "processamento automatizado"
        },
        {
          "t": "li",
          "s": "inferências algorítmicas"
        },
        {
          "t": "li",
          "s": "operadores técnicos"
        },
        {
          "t": "li",
          "s": "provedores externos"
        },
        {
          "t": "li",
          "s": "transferências internacionais de dados, quando aplicável"
        },
        {
          "t": "p",
          "s": "O tratamento observará a legislação aplicável e as condições descritas na Política de Privacidade."
        },
        {
          "t": "h",
          "s": "17. ALTERAÇÕES DA PLATAFORMA E DOS TERMOS"
        },
        {
          "t": "p",
          "s": "A Empresa poderá modificar, atualizar, corrigir, expandir, restringir, suspender ou descontinuar funcionalidades, produtos, recursos, integrações, interfaces ou características da Plataforma a qualquer momento."
        },
        {
          "t": "p",
          "s": "A evolução tecnológica, mudanças regulatórias, exigências operacionais, ajustes comerciais ou razões estratégicas poderão justificar alterações."
        },
        {
          "t": "p",
          "s": "A Empresa poderá atualizar estes Termos periodicamente."
        },
        {
          "t": "p",
          "s": "Quando exigido pela legislação aplicável ou quando materialmente relevante, o Usuário será notificado por meios razoáveis, incluindo:"
        },
        {
          "t": "li",
          "s": "e-mail"
        },
        {
          "t": "li",
          "s": "notificações na Plataforma"
        },
        {
          "t": "li",
          "s": "avisos institucionais"
        },
        {
          "t": "li",
          "s": "outros canais adequados"
        },
        {
          "t": "p",
          "s": "A continuidade de uso após a entrada em vigor das alterações constituirá aceitação da nova versão, ressalvados direitos obrigatórios aplicáveis."
        },
        {
          "t": "h",
          "s": "18. LEGISLAÇÃO APLICÁVEL E RESOLUÇÃO DE DISPUTAS"
        },
        {
          "t": "p",
          "s": "Estes Termos serão regidos pelas leis da República Federativa do Brasil, exceto na medida em que normas obrigatórias de proteção ao consumidor ou legislação imperativa da jurisdição aplicável ao Usuário determinem tratamento diverso."
        },
        {
          "t": "p",
          "s": "Eventuais controvérsias deverão, preferencialmente, ser inicialmente submetidas aos canais administrativos de atendimento disponibilizados pela Empresa, buscando solução razoável e consensual."
        },
        {
          "t": "p",
          "s": "Não sendo possível solução administrativa, a disputa poderá ser submetida às vias legais competentes."
        },
        {
          "t": "p",
          "s": "Quando juridicamente admissível, fica eleito o foro da comarca de São Paulo/SP, Brasil, sem prejuízo dos direitos obrigatórios assegurados ao consumidor pela legislação aplicável."
        },
        {
          "t": "h",
          "s": "19. SANÇÕES E RESTRIÇÕES LEGAIS"
        },
        {
          "t": "p",
          "s": "O Usuário declara que não utilizará a Plataforma em violação a legislações aplicáveis, controles regulatórios, sanções econômicas, embargos ou restrições legais incidentes."
        },
        {
          "t": "p",
          "s": "A Empresa poderá restringir, suspender ou recusar acesso quando necessário para cumprimento legal, regulatório, contratual ou de compliance."
        },
        {
          "t": "h",
          "s": "20. CONTATO"
        },
        {
          "t": "p",
          "s": "Calíope Sociedade Unipessoal Ltda."
        },
        {
          "t": "p",
          "s": "CNPJ: 13.769.065/0001-48"
        },
        {
          "t": "p",
          "s": "Av. Mal. Rondon, 700, Sala 512P, Jardim Chapadão, Campinas/SP, CEP 13070-173"
        },
        {
          "t": "p",
          "s": "Contato geral: contato@caminare.com.br"
        },
        {
          "t": "p",
          "s": "Privacidade / proteção de dados: dpo@caminare.com.br"
        },
        {
          "t": "h",
          "s": "21. DISPOSIÇÕES GERAIS"
        },
        {
          "t": "p",
          "s": "A eventual tolerância da Empresa quanto ao descumprimento de qualquer disposição destes Termos não constituirá renúncia de direito."
        },
        {
          "t": "p",
          "s": "A nulidade, invalidade ou inexigibilidade de qualquer disposição não afetará as demais cláusulas."
        },
        {
          "t": "p",
          "s": "Estes Termos constituem o acordo integral entre as partes quanto ao objeto tratado."
        },
        {
          "t": "p",
          "s": "Obrigações que, por sua natureza, devam sobreviver ao encerramento permanecerão válidas, incluindo disposições relativas a:"
        },
        {
          "t": "li",
          "s": "propriedade intelectual"
        },
        {
          "t": "li",
          "s": "responsabilidade"
        },
        {
          "t": "li",
          "s": "disputas"
        },
        {
          "t": "li",
          "s": "compliance"
        },
        {
          "t": "li",
          "s": "retenções legais"
        },
        {
          "t": "li",
          "s": "direitos regulatórios aplicáveis"
        },
        {
          "t": "p",
          "s": "Muito obrigado."
        }
      ]
    },
    "en": {
      "title": "Terms of Use",
      "updated": "Last updated: Aug 03, 2026",
      "blocks": [
        {
          "t": "p",
          "s": "Welcome to Caminare."
        },
        {
          "t": "p",
          "s": "Caminare was created to support people on their journey of self-awareness, and our relationship with our users is based on respect and transparency. For that reason, we seek to present, in a clear, objective, and accessible manner, the rules that govern and guide the use of our platform."
        },
        {
          "t": "p",
          "s": "Caminare is developed by Calíope, a company committed to ethical conduct, regulatory compliance, respect for privacy, and protection of user rights."
        },
        {
          "t": "p",
          "s": "We understand that legal documents can often be excessively complex and difficult to understand. However, our intention is for you to clearly understand how the platform works, what your rights are, what our responsibilities are, and what limitations apply to the use of the Service."
        },
        {
          "t": "p",
          "s": "For details regarding how your data and privacy are handled, please refer to our Privacy Policy."
        },
        {
          "t": "p",
          "s": "These Terms of Use have been prepared to establish a transparent, secure, and legally appropriate relationship between you and Caminare, in accordance with applicable law and current best practices in consumer protection and digital governance."
        },
        {
          "t": "p",
          "s": "We recommend that you read this document in full before using the platform. By using Caminare, you acknowledge and agree to the conditions set forth herein."
        },
        {
          "t": "p",
          "s": "These Terms of Use (“Terms”) govern access to and use of the digital platform Caminare (“Caminare,” “Platform,” or “Service”), made available by Calíope Sociedade Unipessoal Ltda., a private legal entity organized under the laws of Brazil, registered under CNPJ No. 13.769.065/0001-48, with registered office at Av. Mal. Rondon, 700, Sala 512P, Jardim Chapadão, Campinas/SP, ZIP Code 13070-173, Brazil (“Calíope,” “we,” “us,” or the “Company”)."
        },
        {
          "t": "p",
          "s": "By creating an account, accessing, or using Caminare, the user (“User” or “you”) declares that they have read, understood, and fully agreed to these Terms and the applicable Privacy Policy."
        },
        {
          "t": "p",
          "s": "If you do not agree with these Terms, you must not access or use Caminare."
        },
        {
          "t": "h",
          "s": "1. DEFINITIONS"
        },
        {
          "t": "p",
          "s": "For purposes of these Terms:"
        },
        {
          "t": "p",
          "s": "Account: the individual account created by the User to access Caminare."
        },
        {
          "t": "p",
          "s": "User Content: all content inserted, submitted, recorded, validated, edited, or exported by the User, including texts, transcriptions, records, classifications, observations, validated emotions, identified thoughts, suggested and adjusted beliefs, validated patterns, and any other information related to use of the Platform."
        },
        {
          "t": "p",
          "s": "AI: artificial intelligence systems used by Caminare, whether proprietary or third-party, for processing, organization, categorization, transcription, and generation of suggestions related to the operation of the Platform."
        },
        {
          "t": "p",
          "s": "Third-Party Services: external providers used for operation of the Platform, including technological infrastructure, authentication, analytics, payment processing, artificial intelligence, storage, and related services."
        },
        {
          "t": "h",
          "s": "2. NATURE OF CAMINARE"
        },
        {
          "t": "p",
          "s": "Caminare is a digital self-awareness and personal record organization tool supported by artificial intelligence, intended to assist Users in organizing and visualizing personal records and subjective perceptions."
        },
        {
          "t": "p",
          "s": "Caminare may offer functionalities such as:"
        },
        {
          "t": "li",
          "s": "free-form text entries"
        },
        {
          "t": "li",
          "s": "audio entries with automated transcription"
        },
        {
          "t": "li",
          "s": "algorithmic identification of emotions"
        },
        {
          "t": "li",
          "s": "algorithmic identification of thoughts"
        },
        {
          "t": "li",
          "s": "suggestion of underlying beliefs"
        },
        {
          "t": "li",
          "s": "identification of recurring patterns"
        },
        {
          "t": "li",
          "s": "historical records"
        },
        {
          "t": "li",
          "s": "content export"
        },
        {
          "t": "li",
          "s": "reminders and related functionalities"
        },
        {
          "t": "p",
          "s": "The User acknowledges that the Platform uses automated systems to support the organization and structuring of information, and that errors, inaccuracies, inconsistencies, or inadequate classifications may occur."
        },
        {
          "t": "h",
          "s": "3. ESSENTIAL SERVICE LIMITATIONS"
        },
        {
          "t": "p",
          "s": "Caminare does not constitute a healthcare service, medical assistance service, psychology service, psychiatry service, psychotherapy service, or any clinical, therapeutic, or healthcare-related activity."
        },
        {
          "t": "p",
          "s": "Caminare:"
        },
        {
          "t": "li",
          "s": "does not provide diagnosis"
        },
        {
          "t": "li",
          "s": "does not perform clinical evaluation"
        },
        {
          "t": "li",
          "s": "does not provide medical or psychological screening"
        },
        {
          "t": "li",
          "s": "does not provide emergency assistance"
        },
        {
          "t": "li",
          "s": "does not monitor crises"
        },
        {
          "t": "li",
          "s": "does not detect clinical risk"
        },
        {
          "t": "li",
          "s": "does not replace healthcare professionals"
        },
        {
          "t": "li",
          "s": "does not provide therapeutic follow-up"
        },
        {
          "t": "li",
          "s": "does not contact family members, authorities, or emergency services"
        },
        {
          "t": "li",
          "s": "does not guarantee detection of critical or risk situations"
        },
        {
          "t": "p",
          "s": "Any information, classifications, inferences, or suggestions presented by the Platform are exclusively informational and organizational in nature, intended for personal self-awareness purposes."
        },
        {
          "t": "p",
          "s": "The User remains fully responsible for their own decisions, interpretations, and conduct."
        },
        {
          "t": "p",
          "s": "If the User is experiencing an emergency, crisis, personal risk, or requires professional support, they must immediately seek appropriate local assistance."
        },
        {
          "t": "h",
          "s": "4. ELIGIBILITY"
        },
        {
          "t": "p",
          "s": "Use of Caminare is restricted to individuals 18 (eighteen) years of age or older, who are legally capable of entering into binding agreements."
        },
        {
          "t": "p",
          "s": "By using the Platform, the User represents and warrants that they:"
        },
        {
          "t": "li",
          "s": "are at least 18 years old"
        },
        {
          "t": "li",
          "s": "have legal capacity to accept these Terms"
        },
        {
          "t": "li",
          "s": "will provide truthful, complete, and up-to-date information"
        },
        {
          "t": "li",
          "s": "will use the Platform in compliance with applicable law"
        },
        {
          "t": "p",
          "s": "Use by minors is expressly prohibited."
        },
        {
          "t": "p",
          "s": "If unauthorized use by a minor is identified, the Account may be suspended or terminated, without prejudice to any applicable legal measures."
        },
        {
          "t": "h",
          "s": "5. REGISTRATION AND ACCOUNT"
        },
        {
          "t": "p",
          "s": "To use certain functionalities, the User must create an Account."
        },
        {
          "t": "p",
          "s": "Registration may occur through:"
        },
        {
          "t": "li",
          "s": "email and password"
        },
        {
          "t": "li",
          "s": "Google authentication"
        },
        {
          "t": "li",
          "s": "Apple authentication"
        },
        {
          "t": "li",
          "s": "other methods that may be made available"
        },
        {
          "t": "p",
          "s": "The User agrees to:"
        },
        {
          "t": "li",
          "s": "provide accurate information"
        },
        {
          "t": "li",
          "s": "keep information up to date"
        },
        {
          "t": "li",
          "s": "protect their credentials"
        },
        {
          "t": "li",
          "s": "not share access with third parties"
        },
        {
          "t": "li",
          "s": "not permit unauthorized use of their Account"
        },
        {
          "t": "p",
          "s": "The Account is:"
        },
        {
          "t": "li",
          "s": "personal"
        },
        {
          "t": "li",
          "s": "individual"
        },
        {
          "t": "li",
          "s": "non-transferable"
        },
        {
          "t": "li",
          "s": "non-sublicensable"
        },
        {
          "t": "p",
          "s": "The User is responsible for all activity conducted through their Account, except where unauthorized access occurs without fault attributable to the User."
        },
        {
          "t": "p",
          "s": "If credentials are compromised or unauthorized access is suspected, the User must immediately notify the Company."
        },
        {
          "t": "p",
          "s": "Accounts authenticated through third-party providers may be subject to such providers’ own rules and terms."
        },
        {
          "t": "p",
          "s": "Unavailability of social login services does not prevent the use of reasonable alternative account recovery mechanisms, where technically available."
        },
        {
          "t": "h",
          "s": "6. INACTIVE ACCOUNTS"
        },
        {
          "t": "p",
          "s": "Accounts with no activity for a period equal to or greater than 24 (twenty-four) consecutive months may be deactivated or terminated by the Company."
        },
        {
          "t": "p",
          "s": "Where reasonably possible, prior notice may be provided to the User."
        },
        {
          "t": "p",
          "s": "Any retention or deletion of data will be governed by the applicable Privacy Policy."
        },
        {
          "t": "h",
          "s": "7. FREE TRIAL PERIOD"
        },
        {
          "t": "p",
          "s": "The Company may provide a promotional free-use period (“Trial”), currently for up to 15 (fifteen) days, subject to the conditions in effect at the time of subscription."
        },
        {
          "t": "p",
          "s": "The Trial:"
        },
        {
          "t": "li",
          "s": "may be modified, suspended, or discontinued at any time"
        },
        {
          "t": "li",
          "s": "may be subject to eligibility requirements"
        },
        {
          "t": "li",
          "s": "may be limited to new users"
        },
        {
          "t": "p",
          "s": "At the end of the free period, access to paid functionalities may automatically expire, and the User may voluntarily choose whether to subscribe to a paid plan."
        },
        {
          "t": "p",
          "s": "Expiration of the Trial does not create automatic paid renewal unless a corresponding subscription is expressly contracted through the applicable platform flow."
        },
        {
          "t": "h",
          "s": "8. SUBSCRIPTIONS, PAYMENTS, AND CANCELLATION"
        },
        {
          "t": "p",
          "s": "Caminare may offer different subscription plans, including free and paid options, with different features, functionalities, usage limits, maximum number of records, pricing, and commercial terms, as presented on the Platform, on Caminare's official pricing page, and during the subscription process. Available plans may include, by way of example:"
        },
        {
          "t": "li",
          "s": "monthly plan"
        },
        {
          "t": "li",
          "s": "annual plan"
        },
        {
          "t": "li",
          "s": "specific promotional offers"
        },
        {
          "t": "p",
          "s": "Pricing, currency, promotions, and commercial conditions may vary depending on:"
        },
        {
          "t": "li",
          "s": "country"
        },
        {
          "t": "li",
          "s": "app store"
        },
        {
          "t": "li",
          "s": "promotional campaign"
        },
        {
          "t": "li",
          "s": "time of subscription"
        },
        {
          "t": "p",
          "s": "Subscriptions purchased via the Apple App Store or Google Play Store are additionally subject to the policies and rules of those platforms."
        },
        {
          "t": "h2",
          "s": "8.1 Automatic Renewal"
        },
        {
          "t": "p",
          "s": "Unless otherwise stated during the subscription flow, recurring subscriptions automatically renew at the end of each applicable billing cycle."
        },
        {
          "t": "p",
          "s": "By subscribing to a recurring plan, the User authorizes the applicable recurring charges through the relevant payment platform."
        },
        {
          "t": "h2",
          "s": "8.2 Cancellation"
        },
        {
          "t": "p",
          "s": "The User may cancel automatic renewal at any time through the means made available by the applicable platform."
        },
        {
          "t": "p",
          "s": "Cancellation:"
        },
        {
          "t": "li",
          "s": "stops future renewals"
        },
        {
          "t": "li",
          "s": "does not automatically entitle the User to a refund for an already contracted billing period"
        },
        {
          "t": "li",
          "s": "preserves access until the end of the active paid cycle, except where mandatory law provides otherwise"
        },
        {
          "t": "h2",
          "s": "8.3 Refunds"
        },
        {
          "t": "p",
          "s": "Refunds shall be governed by:"
        },
        {
          "t": "li",
          "s": "applicable law"
        },
        {
          "t": "li",
          "s": "mandatory app store rules"
        },
        {
          "t": "li",
          "s": "the policies of the relevant payment platform"
        },
        {
          "t": "p",
          "s": "Where legally applicable withdrawal rights or equivalent mandatory consumer rights exist, the Company will comply with the applicable law."
        },
        {
          "t": "h2",
          "s": "8.4 Usage Limits"
        },
        {
          "t": "p",
          "s": "Each subscription plan may establish operational limits, including, without limitation, the maximum number of records that may be created during a billing cycle."
        },
        {
          "t": "p",
          "s": "Such limits are described in the Platform at the time of subscription and may vary according to the selected plan."
        },
        {
          "t": "p",
          "s": "Once the applicable limit is reached, the User may continue to access previously created content but may be prevented from creating additional records until:"
        },
        {
          "t": "li",
          "s": "a new billing cycle begins"
        },
        {
          "t": "li",
          "s": "the User upgrades to another available plan; or"
        },
        {
          "t": "li",
          "s": "additional capacity is otherwise made available by the Company"
        },
        {
          "t": "h2",
          "s": "8.5 Changes to Plans and Commercial Terms"
        },
        {
          "t": "p",
          "s": "The Company may create, modify, replace, or discontinue subscription plans, features, usage limits, pricing, and other commercial terms at any time, subject to applicable law."
        },
        {
          "t": "p",
          "s": "Any such changes will apply prospectively and will not affect subscriptions already purchased during the current billing cycle, except where permitted by applicable law or where prior notice to the User is provided, if required."
        },
        {
          "t": "p",
          "s": "Current subscription plans, prices, usage limits, features, and applicable commercial conditions are available on the Company's official pricing page at https://caminare.com.br/planos, or within the applicable app store at the time of subscription. In the event of any discrepancy, the information presented during the subscription flow shall prevail."
        },
        {
          "t": "h",
          "s": "9. PERMITTED USE AND USAGE RESTRICTIONS"
        },
        {
          "t": "p",
          "s": "Caminare is made available exclusively for personal, individual, and lawful use, within the purposes established in these Terms."
        },
        {
          "t": "p",
          "s": "The User agrees to use the Platform in a manner consistent with its intended purpose of personal organization, self-awareness, and individual recordkeeping."
        },
        {
          "t": "p",
          "s": "The following are expressly prohibited:"
        },
        {
          "t": "li",
          "s": "using the Platform for unlawful, fraudulent, or otherwise illegal purposes"
        },
        {
          "t": "li",
          "s": "inserting, processing, or sharing personal data of third parties without proper legal basis, authorization, or legitimate authority"
        },
        {
          "t": "li",
          "s": "using the Platform for harassment, fraud, identity misrepresentation, impersonation, or any abusive conduct"
        },
        {
          "t": "li",
          "s": "attempting to access accounts, systems, data, or environments without authorization"
        },
        {
          "t": "li",
          "s": "circumventing, interfering with, compromising, or attempting to compromise authentication, security, or protection mechanisms of the Platform"
        },
        {
          "t": "li",
          "s": "performing scraping, crawling, harvesting, automated mining, or systematic data extraction"
        },
        {
          "t": "li",
          "s": "using bots, scripts, abusive automation, or any unauthorized automated mechanisms"
        },
        {
          "t": "li",
          "s": "engaging in reverse engineering, decompilation, disassembly, replication, improper benchmarking, or attempts to discover architecture, prompts, internal workflows, or proprietary methodologies"
        },
        {
          "t": "li",
          "s": "inserting malware, malicious code, corrupted files, or any elements capable of compromising the Platform"
        },
        {
          "t": "li",
          "s": "using Caminare as backend infrastructure or a service for third parties"
        },
        {
          "t": "li",
          "s": "reselling, sublicensing, redistributing, or commercially exploiting the Platform without express authorization"
        },
        {
          "t": "li",
          "s": "using the Platform in a manner inconsistent with its intended purpose"
        },
        {
          "t": "li",
          "s": "interfering with the normal functioning of the Service"
        },
        {
          "t": "li",
          "s": "testing vulnerabilities without formal authorization from the Company"
        },
        {
          "t": "p",
          "s": "Violation of these restrictions may result in suspension, blocking, termination of the Account, technical measures, administrative actions, and any legal remedies available."
        },
        {
          "t": "h",
          "s": "10. USER CONTENT"
        },
        {
          "t": "p",
          "s": "The User may insert, record, validate, edit, export, and organize their own content through the Platform."
        },
        {
          "t": "p",
          "s": "The User represents and warrants that they:"
        },
        {
          "t": "li",
          "s": "have legitimate authority to submit the content provided"
        },
        {
          "t": "li",
          "s": "do not violate third-party rights"
        },
        {
          "t": "li",
          "s": "will not use the Platform for improper processing of third-party data"
        },
        {
          "t": "li",
          "s": "are responsible for the legality of submitted content"
        },
        {
          "t": "li",
          "s": "are responsible for the consequences of using, exporting, or sharing such content"
        },
        {
          "t": "p",
          "s": "Ownership of User Content remains with the User."
        },
        {
          "t": "h2",
          "s": "10.1 Operational License"
        },
        {
          "t": "p",
          "s": "To enable operation of the Platform, the User grants the Company a non-exclusive, worldwide, limited, and revocable license, to the extent permitted by operation of the Service, to:"
        },
        {
          "t": "li",
          "s": "store"
        },
        {
          "t": "li",
          "s": "process"
        },
        {
          "t": "li",
          "s": "organize"
        },
        {
          "t": "li",
          "s": "transcribe"
        },
        {
          "t": "li",
          "s": "classify"
        },
        {
          "t": "li",
          "s": "structure"
        },
        {
          "t": "li",
          "s": "display"
        },
        {
          "t": "li",
          "s": "export"
        },
        {
          "t": "li",
          "s": "technically transmit"
        },
        {
          "t": "li",
          "s": "operationally process"
        },
        {
          "t": "p",
          "s": "User Content exclusively for:"
        },
        {
          "t": "li",
          "s": "provision of the Service"
        },
        {
          "t": "li",
          "s": "execution of contracted functionalities"
        },
        {
          "t": "li",
          "s": "technical support"
        },
        {
          "t": "li",
          "s": "operational security"
        },
        {
          "t": "li",
          "s": "analytics"
        },
        {
          "t": "li",
          "s": "Platform improvement"
        },
        {
          "t": "li",
          "s": "technological enhancement"
        },
        {
          "t": "li",
          "s": "development of internal improvements"
        },
        {
          "t": "p",
          "s": "Anonymized and aggregated data may be used for analytics, technological improvement, product development, and model enhancement, without individual identification of the User."
        },
        {
          "t": "p",
          "s": "Identifiable User data will not be used for artificial intelligence model training for general improvement purposes."
        },
        {
          "t": "h2",
          "s": "10.2 User Sharing"
        },
        {
          "t": "p",
          "s": "The Platform may provide functionalities for exporting or sharing content, including PDF export and text copy functionality."
        },
        {
          "t": "p",
          "s": "Any sharing performed by the User with third parties occurs under the User’s sole responsibility."
        },
        {
          "t": "p",
          "s": "The Company is not responsible for the use, processing, storage, redistribution, or exposure of content after voluntary sharing by the User."
        },
        {
          "t": "h2",
          "s": "10.3 Feedback"
        },
        {
          "t": "p",
          "s": "Suggestions, comments, ideas, improvement proposals, criticism, or feedback submitted by the User may be freely used by the Company without compensation, acknowledgment, confidentiality obligations, or usage restrictions, except where mandatory law provides otherwise."
        },
        {
          "t": "h",
          "s": "11. ARTIFICIAL INTELLIGENCE AND OUTPUT LIMITATIONS"
        },
        {
          "t": "p",
          "s": "Caminare uses proprietary and/or third-party artificial intelligence systems as a core component of the Platform."
        },
        {
          "t": "p",
          "s": "These systems may be used, among other purposes, for:"
        },
        {
          "t": "li",
          "s": "audio transcription"
        },
        {
          "t": "li",
          "s": "emotion identification"
        },
        {
          "t": "li",
          "s": "organization of records"
        },
        {
          "t": "li",
          "s": "thought identification"
        },
        {
          "t": "li",
          "s": "suggestion of underlying beliefs"
        },
        {
          "t": "li",
          "s": "pattern identification"
        },
        {
          "t": "li",
          "s": "structuring of information"
        },
        {
          "t": "li",
          "s": "support for navigation and user experience"
        },
        {
          "t": "p",
          "s": "The User acknowledges and accepts that AI systems:"
        },
        {
          "t": "li",
          "s": "may generate errors"
        },
        {
          "t": "li",
          "s": "may produce inaccuracies"
        },
        {
          "t": "li",
          "s": "may generate inadequate classifications"
        },
        {
          "t": "li",
          "s": "may present inconsistencies"
        },
        {
          "t": "li",
          "s": "may fail"
        },
        {
          "t": "li",
          "s": "do not possess human understanding"
        },
        {
          "t": "li",
          "s": "operate using probabilistic models"
        },
        {
          "t": "li",
          "s": "depend on the quality of the data provided"
        },
        {
          "t": "p",
          "s": "Suggestions generated by the Platform:"
        },
        {
          "t": "li",
          "s": "do not constitute factual truth"
        },
        {
          "t": "li",
          "s": "do not constitute professional guidance"
        },
        {
          "t": "li",
          "s": "do not constitute medical, psychological, therapeutic, legal, or financial advice"
        },
        {
          "t": "li",
          "s": "do not replace human evaluation"
        },
        {
          "t": "p",
          "s": "The User remains fully responsible for validating, interpreting, accepting, rejecting, or disregarding suggestions presented."
        },
        {
          "t": "p",
          "s": "The Company does not guarantee absolute accuracy, completeness, subjective adequacy, or individual suitability of generated outputs."
        },
        {
          "t": "h",
          "s": "12. AVAILABILITY, MAINTENANCE, AND SUPPORT"
        },
        {
          "t": "p",
          "s": "The Company will make commercially reasonable efforts to keep the Platform operational but does not guarantee continuous, uninterrupted, error-free, or permanently available service."
        },
        {
          "t": "p",
          "s": "The Service may experience temporary interruptions due to reasons such as:"
        },
        {
          "t": "li",
          "s": "scheduled maintenance"
        },
        {
          "t": "li",
          "s": "emergency maintenance"
        },
        {
          "t": "li",
          "s": "technical corrections"
        },
        {
          "t": "li",
          "s": "updates"
        },
        {
          "t": "li",
          "s": "infrastructure changes"
        },
        {
          "t": "li",
          "s": "technical failures"
        },
        {
          "t": "li",
          "s": "bugs"
        },
        {
          "t": "li",
          "s": "third-party unavailability"
        },
        {
          "t": "li",
          "s": "failures of external providers"
        },
        {
          "t": "li",
          "s": "AI service outages"
        },
        {
          "t": "li",
          "s": "cyberattacks"
        },
        {
          "t": "li",
          "s": "force majeure events"
        },
        {
          "t": "li",
          "s": "connectivity failures"
        },
        {
          "t": "li",
          "s": "technical incompatibilities with the User’s device"
        },
        {
          "t": "p",
          "s": "The Company may alter, update, correct, suspend, limit, or modify functionalities at any time, temporarily or permanently."
        },
        {
          "t": "p",
          "s": "Where reasonably possible, significant scheduled maintenance may be communicated in advance."
        },
        {
          "t": "h2",
          "s": "12.1 Third-Party Services"
        },
        {
          "t": "p",
          "s": "Operation of the Platform depends on external services, including infrastructure, authentication, analytics, payments, and technology providers."
        },
        {
          "t": "p",
          "s": "The Company is not responsible for unavailability exclusively resulting from third parties outside its reasonable control."
        },
        {
          "t": "h2",
          "s": "12.2 Support"
        },
        {
          "t": "p",
          "s": "Operational support may be provided through the Company’s officially available channels."
        },
        {
          "t": "p",
          "s": "The Company does not guarantee specific response times, contractual SLA commitments, or resolution within fixed deadlines, except where legally required."
        },
        {
          "t": "h",
          "s": "13. INTELLECTUAL PROPERTY"
        },
        {
          "t": "p",
          "s": "All rights related to Caminare belong to the Company or its licensors, as applicable."
        },
        {
          "t": "p",
          "s": "This includes, without limitation:"
        },
        {
          "t": "li",
          "s": "the Caminare trademark"
        },
        {
          "t": "li",
          "s": "visual identity"
        },
        {
          "t": "li",
          "s": "interface"
        },
        {
          "t": "li",
          "s": "layout"
        },
        {
          "t": "li",
          "s": "design"
        },
        {
          "t": "li",
          "s": "user experience"
        },
        {
          "t": "li",
          "s": "software"
        },
        {
          "t": "li",
          "s": "source code"
        },
        {
          "t": "li",
          "s": "technological architecture"
        },
        {
          "t": "li",
          "s": "prompts"
        },
        {
          "t": "li",
          "s": "internal workflows"
        },
        {
          "t": "li",
          "s": "methodology"
        },
        {
          "t": "li",
          "s": "taxonomies"
        },
        {
          "t": "li",
          "s": "proprietary classifications"
        },
        {
          "t": "li",
          "s": "databases"
        },
        {
          "t": "li",
          "s": "documentation"
        },
        {
          "t": "li",
          "s": "institutional materials"
        },
        {
          "t": "li",
          "s": "functionalities"
        },
        {
          "t": "li",
          "s": "content produced by the Company"
        },
        {
          "t": "p",
          "s": "These Terms do not transfer any intellectual property rights to the User, except for a limited license for personal use of the Platform."
        },
        {
          "t": "p",
          "s": "The User is prohibited from:"
        },
        {
          "t": "li",
          "s": "copying"
        },
        {
          "t": "li",
          "s": "reproducing"
        },
        {
          "t": "li",
          "s": "redistributing"
        },
        {
          "t": "li",
          "s": "adapting"
        },
        {
          "t": "li",
          "s": "modifying"
        },
        {
          "t": "li",
          "s": "disassembling"
        },
        {
          "t": "li",
          "s": "decompiling"
        },
        {
          "t": "li",
          "s": "creating derivative works"
        },
        {
          "t": "li",
          "s": "replicating functionalities"
        },
        {
          "t": "li",
          "s": "commercially exploiting"
        },
        {
          "t": "li",
          "s": "sublicensing"
        },
        {
          "t": "li",
          "s": "commercializing"
        },
        {
          "t": "li",
          "s": "any protected element of the Platform without express authorization"
        },
        {
          "t": "h",
          "s": "14. SUSPENSION, RESTRICTION, AND ACCOUNT TERMINATION"
        },
        {
          "t": "p",
          "s": "The Company may, at its reasonable discretion, suspend, restrict, limit, or terminate, in whole or in part, the User’s access to the Platform, temporarily or permanently, including without prior notice where necessary, if it identifies or reasonably suspects:"
        },
        {
          "t": "li",
          "s": "violation of these Terms"
        },
        {
          "t": "li",
          "s": "unlawful or abusive use"
        },
        {
          "t": "li",
          "s": "fraud or attempted fraud"
        },
        {
          "t": "li",
          "s": "improper insertion of third-party data"
        },
        {
          "t": "li",
          "s": "security compromise"
        },
        {
          "t": "li",
          "s": "unauthorized automated use"
        },
        {
          "t": "li",
          "s": "reverse engineering"
        },
        {
          "t": "li",
          "s": "attempted improper technical exploitation"
        },
        {
          "t": "li",
          "s": "applicable payment default"
        },
        {
          "t": "li",
          "s": "judicial, regulatory, or legal determination"
        },
        {
          "t": "li",
          "s": "relevant operational, legal, or reputational risk"
        },
        {
          "t": "li",
          "s": "conduct that compromises the integrity of the Platform or third parties"
        },
        {
          "t": "p",
          "s": "Such measures may be adopted to protect:"
        },
        {
          "t": "li",
          "s": "the Company"
        },
        {
          "t": "li",
          "s": "the Platform"
        },
        {
          "t": "li",
          "s": "users"
        },
        {
          "t": "li",
          "s": "third parties"
        },
        {
          "t": "li",
          "s": "technological infrastructure"
        },
        {
          "t": "li",
          "s": "applicable regulatory compliance"
        },
        {
          "t": "p",
          "s": "Where reasonably possible and compatible with security requirements, the Company may notify the User either before or after taking such action."
        },
        {
          "t": "p",
          "s": "Termination by the User"
        },
        {
          "t": "p",
          "s": "The User may terminate their Account at any time through the means made available by the Platform."
        },
        {
          "t": "p",
          "s": "Termination of the Account:"
        },
        {
          "t": "li",
          "s": "does not automatically eliminate obligations already incurred"
        },
        {
          "t": "li",
          "s": "does not automatically entitle the User to refunds, except where mandatory law provides otherwise"
        },
        {
          "t": "li",
          "s": "shall be subject to the retention and deletion rules described in the Privacy Policy"
        },
        {
          "t": "h",
          "s": "15. LIMITATION OF LIABILITY"
        },
        {
          "t": "p",
          "s": "To the maximum extent permitted by applicable law, the Company shall not be liable for damages arising from circumstances outside its reasonable control or from improper use of the Platform."
        },
        {
          "t": "p",
          "s": "Without prejudice to legally non-waivable consumer rights, the Company does not guarantee that:"
        },
        {
          "t": "li",
          "s": "the Platform will operate without interruptions"
        },
        {
          "t": "li",
          "s": "the Platform will be free of bugs"
        },
        {
          "t": "li",
          "s": "the Platform will remain permanently available"
        },
        {
          "t": "li",
          "s": "AI-generated outputs will be correct"
        },
        {
          "t": "li",
          "s": "classifications will be accurate"
        },
        {
          "t": "li",
          "s": "suggestions will adequately reflect the User’s subjective reality"
        },
        {
          "t": "li",
          "s": "the Platform will meet specific individual expectations"
        },
        {
          "t": "p",
          "s": "The User acknowledges that use of the Platform occurs at their own risk, consistent with the nature of the Service."
        },
        {
          "t": "p",
          "s": "The Company is not responsible for:"
        },
        {
          "t": "h2",
          "s": "15.1 Personal Decisions by the User"
        },
        {
          "t": "p",
          "s": "Any decision, interpretation, conduct, action, or omission based on outputs, classifications, suggestions, inferences, or information displayed by the Platform."
        },
        {
          "t": "h2",
          "s": "15.2 Improper Use"
        },
        {
          "t": "p",
          "s": "Use contrary to these Terms, applicable law, or the intended purpose of the Service."
        },
        {
          "t": "h2",
          "s": "15.3 User-Submitted Data"
        },
        {
          "t": "p",
          "s": "Incorrect, incomplete, inaccurate, misleading, inappropriate, or unlawfully submitted content."
        },
        {
          "t": "h2",
          "s": "15.4 Third-Party Services"
        },
        {
          "t": "p",
          "s": "Failures, unavailability, interruptions, limitations, or conduct relating to third parties, including:"
        },
        {
          "t": "li",
          "s": "AI providers"
        },
        {
          "t": "li",
          "s": "cloud services"
        },
        {
          "t": "li",
          "s": "payment gateways"
        },
        {
          "t": "li",
          "s": "Apple"
        },
        {
          "t": "li",
          "s": "Google"
        },
        {
          "t": "li",
          "s": "authentication providers"
        },
        {
          "t": "li",
          "s": "analytics providers"
        },
        {
          "t": "li",
          "s": "telecommunications services"
        },
        {
          "t": "li",
          "s": "the User’s internet connection"
        },
        {
          "t": "h2",
          "s": "15.5 Voluntary Sharing"
        },
        {
          "t": "p",
          "s": "Any consequences resulting from export or voluntary sharing performed by the User."
        },
        {
          "t": "h2",
          "s": "15.6 Security Outside Reasonable Control"
        },
        {
          "t": "p",
          "s": "Cyberattacks, external fraud, systemic failures, force majeure, or equivalent events outside the Company’s reasonable control."
        },
        {
          "t": "h2",
          "s": "15.7 Essential Product Limitation"
        },
        {
          "t": "p",
          "s": "Caminare is a self-awareness and personal organization tool."
        },
        {
          "t": "p",
          "s": "It must not be used as:"
        },
        {
          "t": "li",
          "s": "an emergency response tool"
        },
        {
          "t": "li",
          "s": "a clinical service"
        },
        {
          "t": "li",
          "s": "a substitute for therapy"
        },
        {
          "t": "li",
          "s": "a risk monitoring system"
        },
        {
          "t": "li",
          "s": "a crisis intervention mechanism"
        },
        {
          "t": "li",
          "s": "a professional decision-making system"
        },
        {
          "t": "p",
          "s": "Nothing on the Platform constitutes professional advice."
        },
        {
          "t": "h",
          "s": "16. PRIVACY AND DATA PROCESSING"
        },
        {
          "t": "p",
          "s": "The processing of personal data within the context of Caminare is governed by the Privacy Policy, which is a separate and complementary document to these Terms."
        },
        {
          "t": "p",
          "s": "By using the Platform, the User acknowledges that certain data may be processed as described in the Privacy Policy, including, where applicable:"
        },
        {
          "t": "li",
          "s": "registration data"
        },
        {
          "t": "li",
          "s": "technical data"
        },
        {
          "t": "li",
          "s": "usage data"
        },
        {
          "t": "li",
          "s": "records submitted by the User"
        },
        {
          "t": "li",
          "s": "transcriptions"
        },
        {
          "t": "li",
          "s": "operational inferences"
        },
        {
          "t": "li",
          "s": "analytics"
        },
        {
          "t": "li",
          "s": "data necessary for execution of the Service"
        },
        {
          "t": "p",
          "s": "The User acknowledges that operation of the Platform may involve:"
        },
        {
          "t": "li",
          "s": "automated processing"
        },
        {
          "t": "li",
          "s": "algorithmic inferences"
        },
        {
          "t": "li",
          "s": "technical operators"
        },
        {
          "t": "li",
          "s": "external providers"
        },
        {
          "t": "li",
          "s": "international data transfers, where applicable"
        },
        {
          "t": "p",
          "s": "Data processing shall be conducted in accordance with applicable law and the conditions described in the Privacy Policy."
        },
        {
          "t": "h",
          "s": "17. CHANGES TO THE PLATFORM AND TERMS"
        },
        {
          "t": "p",
          "s": "The Company may modify, update, correct, expand, restrict, suspend, or discontinue functionalities, products, resources, integrations, interfaces, or characteristics of the Platform at any time."
        },
        {
          "t": "p",
          "s": "Technological evolution, regulatory changes, operational requirements, commercial adjustments, or strategic reasons may justify such changes."
        },
        {
          "t": "p",
          "s": "The Company may periodically update these Terms."
        },
        {
          "t": "p",
          "s": "Where required by applicable law or where materially relevant, the User will be notified through reasonable means, including:"
        },
        {
          "t": "li",
          "s": "email"
        },
        {
          "t": "li",
          "s": "in-platform notifications"
        },
        {
          "t": "li",
          "s": "institutional notices"
        },
        {
          "t": "li",
          "s": "other appropriate channels"
        },
        {
          "t": "p",
          "s": "Continued use after the effective date of such changes constitutes acceptance of the updated version, subject to applicable mandatory rights."
        },
        {
          "t": "h",
          "s": "18. GOVERNING LAW AND DISPUTE RESOLUTION"
        },
        {
          "t": "p",
          "s": "These Terms shall be governed by the laws of the Federative Republic of Brazil, except to the extent that mandatory consumer protection rules or mandatory laws of the User’s applicable jurisdiction require otherwise."
        },
        {
          "t": "p",
          "s": "Any disputes should preferably first be submitted to the Company’s available administrative support channels in an effort to seek a reasonable and amicable resolution."
        },
        {
          "t": "p",
          "s": "If administrative resolution is not possible, the dispute may be submitted to the competent legal authorities."
        },
        {
          "t": "p",
          "s": "Where legally permissible, the courts of São Paulo/SP, Brazil, shall have jurisdiction, without prejudice to mandatory consumer rights guaranteed under applicable law."
        },
        {
          "t": "h",
          "s": "19. SANCTIONS AND LEGAL RESTRICTIONS"
        },
        {
          "t": "p",
          "s": "The User declares that they will not use the Platform in violation of applicable laws, regulatory controls, economic sanctions, embargoes, or applicable legal restrictions."
        },
        {
          "t": "p",
          "s": "The Company may restrict, suspend, or refuse access where necessary for legal, regulatory, contractual, or compliance purposes."
        },
        {
          "t": "h",
          "s": "20. CONTACT"
        },
        {
          "t": "p",
          "s": "Calíope Sociedade Unipessoal Ltda."
        },
        {
          "t": "p",
          "s": "CNPJ: 13.769.065/0001-48"
        },
        {
          "t": "p",
          "s": "Av. Mal. Rondon, 700, Sala 512P, Jardim Chapadão"
        },
        {
          "t": "p",
          "s": "Campinas/SP"
        },
        {
          "t": "p",
          "s": "ZIP Code 13070-173"
        },
        {
          "t": "p",
          "s": "Brazil"
        },
        {
          "t": "p",
          "s": "General contact: contato@caminare.com.br"
        },
        {
          "t": "p",
          "s": "Privacy / data protection: dpo@caminare.com.br"
        },
        {
          "t": "h",
          "s": "21. GENERAL PROVISIONS"
        },
        {
          "t": "p",
          "s": "Any tolerance by the Company regarding non-compliance with any provision of these Terms shall not constitute waiver of rights."
        },
        {
          "t": "p",
          "s": "The nullity, invalidity, or unenforceability of any provision shall not affect the validity of the remaining provisions."
        },
        {
          "t": "p",
          "s": "These Terms constitute the entire agreement between the parties regarding the matters addressed herein."
        },
        {
          "t": "p",
          "s": "Obligations that, by their nature, should survive termination shall remain in effect, including provisions relating to:"
        },
        {
          "t": "li",
          "s": "intellectual property"
        },
        {
          "t": "li",
          "s": "liability"
        },
        {
          "t": "li",
          "s": "disputes"
        },
        {
          "t": "li",
          "s": "compliance"
        },
        {
          "t": "li",
          "s": "legal retention obligations"
        },
        {
          "t": "li",
          "s": "applicable regulatory rights"
        },
        {
          "t": "p",
          "s": "Thank you for using Caminare."
        }
      ]
    }
  },
  "privacy": {
    "pt-BR": {
      "title": "Política de Privacidade",
      "updated": "Última atualização: 19/08/2026",
      "blocks": [
        {
          "t": "p",
          "s": "Seja bem-vindo ao Caminare."
        },
        {
          "t": "p",
          "s": "O Caminare nasceu para ajudar pessoas em sua jornada de autoconhecimento e sabemos o quanto privacidade é algo importante nesse tema. Por isso, privacidade, confidencialidade e segurança não são apenas requisitos legais para nós, são partes essenciais do nosso trabalho."
        },
        {
          "t": "p",
          "s": "A Calíope desenvolveu o Caminare com o compromisso de atuar de forma ética, transparente e responsável no tratamento de dados pessoais, especialmente considerando a natureza sensível e subjetiva de muitos registros realizados na plataforma."
        },
        {
          "t": "p",
          "s": "Adotamos sempre práticas compatíveis com padrões modernos de proteção de dados, governança digital e segurança da informação, sempre respeitando a legislação aplicável e os direitos dos usuários, além de buscar sempre agir com respeito, responsabilidade e seriedade com aqueles que confiam seus dados a nós."
        },
        {
          "t": "p",
          "s": "Também temos o compromisso de trabalhar com fornecedores e parceiros tecnológicos reconhecidos internacionalmente por sua boa reputação em segurança, privacidade, confiabilidade e conformidade regulatória. Operamos com nosso backoffice rodando sempre em empresas globais de infraestrutura e tecnologia e outros provedores de tecnologia amplamente reconhecidos no mercado."
        },
        {
          "t": "p",
          "s": "Ao mesmo tempo, acreditamos que transparência é fundamental. Por isso, buscamos explicar de forma clara quais dados podem ser tratados, por quais motivos, como esses dados podem ser utilizados e quais medidas buscamos adotar para protegê-los."
        },
        {
          "t": "p",
          "s": "Nosso objetivo é permitir que o usuário utilize o Caminare com clareza e confiança sobre o quanto sua privacidade será respeitada e de que forma suas informações são tratadas."
        },
        {
          "t": "p",
          "s": "Recomendamos a leitura completa desta Política de Privacidade, pois, ao  utilizar o Caminare, você declara ciência desta Política."
        },
        {
          "t": "h",
          "s": "1. QUEM PODE UTILIZAR O CAMINARE"
        },
        {
          "t": "p",
          "s": "O Caminare é destinado exclusivamente a pessoas com 18 (dezoito) anos ou mais."
        },
        {
          "t": "p",
          "s": "O uso por menores de idade não é permitido."
        },
        {
          "t": "p",
          "s": "Caso identifiquemos uso indevido por menor, a conta poderá ser suspensa ou encerrada."
        },
        {
          "t": "h",
          "s": "2. QUAIS DADOS COLETAMOS"
        },
        {
          "t": "p",
          "s": "Podemos coletar diferentes categorias de dados conforme a utilização da Plataforma."
        },
        {
          "t": "h2",
          "s": "2.1 Dados cadastrais"
        },
        {
          "t": "p",
          "s": "Incluem, conforme aplicável:"
        },
        {
          "t": "li",
          "s": "nome"
        },
        {
          "t": "li",
          "s": "endereço de e-mail"
        },
        {
          "t": "li",
          "s": "identificadores vinculados a login Google ou Apple"
        },
        {
          "t": "li",
          "s": "credenciais de autenticação"
        },
        {
          "t": "li",
          "s": "informações relacionadas à assinatura"
        },
        {
          "t": "h2",
          "s": "2.2 Conteúdo inserido pelo usuário"
        },
        {
          "t": "p",
          "s": "O Caminare é estruturado para permitir o registro e organização de informações pessoais inseridas voluntariamente pelo usuário."
        },
        {
          "t": "p",
          "s": "Esses dados podem incluir:"
        },
        {
          "t": "li",
          "s": "textos livres"
        },
        {
          "t": "li",
          "s": "registros pessoais"
        },
        {
          "t": "li",
          "s": "áudios enviados para transcrição"
        },
        {
          "t": "li",
          "s": "transcrições"
        },
        {
          "t": "li",
          "s": "emoções identificadas e/ou validadas"
        },
        {
          "t": "li",
          "s": "pensamentos identificados e/ou validados"
        },
        {
          "t": "li",
          "s": "crenças sugeridas e/ou ajustadas"
        },
        {
          "t": "li",
          "s": "padrões identificados e/ou validados"
        },
        {
          "t": "li",
          "s": "tags"
        },
        {
          "t": "li",
          "s": "histórico de registros"
        },
        {
          "t": "li",
          "s": "relatórios e exportações"
        },
        {
          "t": "p",
          "s": "O usuário é responsável pelo conteúdo que decide inserir na Plataforma."
        },
        {
          "t": "h2",
          "s": "2.3 Dados técnicos e de uso"
        },
        {
          "t": "p",
          "s": "Podemos coletar automaticamente determinados dados técnicos e de uso relacionados à utilização da Plataforma, incluindo, conforme aplicável:"
        },
        {
          "t": "li",
          "s": "endereço IP"
        },
        {
          "t": "li",
          "s": "identificadores técnicos ou de dispositivo"
        },
        {
          "t": "li",
          "s": "modelo e características do dispositivo"
        },
        {
          "t": "li",
          "s": "sistema operacional"
        },
        {
          "t": "li",
          "s": "versão do aplicativo"
        },
        {
          "t": "li",
          "s": "idioma e configurações regionais"
        },
        {
          "t": "li",
          "s": "logs técnicos"
        },
        {
          "t": "li",
          "s": "informações de sessão"
        },
        {
          "t": "li",
          "s": "informações sobre navegação e interação com a Plataforma"
        },
        {
          "t": "li",
          "s": "dados relacionados ao desempenho e funcionamento do aplicativo"
        },
        {
          "t": "li",
          "s": "relatórios de falhas (crash reports)"
        },
        {
          "t": "li",
          "s": "dados de analytics e mensuração de uso"
        },
        {
          "t": "li",
          "s": "informações sobre eventos e ações realizadas na Plataforma"
        },
        {
          "t": "p",
          "s": "Os dados de analytics e mensuração poderão incluir informações sobre eventos como criação e acesso à Conta, login, início e conversão do período gratuito, visualização de planos, contratação e renovação de assinaturas, utilização das funcionalidades, criação de registros, marcos de utilização, acesso a históricos, insights e resumos, exportação ou compartilhamento de conteúdo, permissões do dispositivo, falhas técnicas e outros eventos necessários à análise do funcionamento e desempenho da Plataforma."
        },
        {
          "t": "p",
          "s": "Quando utilizados para analytics, mensuração de produto ou mensuração de campanhas, esses eventos poderão utilizar metadados e informações operacionais, como tipo de evento, tipo de entrada (texto ou voz), número ou quantidade de registros, tipo de plano, período de cobrança, informações relacionadas à conversão, status de determinadas operações e informações técnicas necessárias à mensuração."
        },
        {
          "t": "p",
          "s": "O conteúdo dos registros do usuário, incluindo textos, áudios, transcrições, emoções, pensamentos, crenças, padrões e outras informações subjetivas inseridas ou geradas no contexto do uso do Caminare, não é enviado aos provedores de analytics ou de publicidade como parte desses eventos de mensuração."
        },
        {
          "t": "p",
          "s": "Os dados técnicos e de uso poderão ser utilizados para:"
        },
        {
          "t": "li",
          "s": "funcionamento e manutenção da Plataforma"
        },
        {
          "t": "li",
          "s": "segurança"
        },
        {
          "t": "li",
          "s": "diagnóstico e correção de falhas"
        },
        {
          "t": "li",
          "s": "análise de desempenho"
        },
        {
          "t": "li",
          "s": "compreensão da utilização das funcionalidades"
        },
        {
          "t": "li",
          "s": "melhoria da experiência do usuário"
        },
        {
          "t": "li",
          "s": "desenvolvimento e aprimoramento do produto"
        },
        {
          "t": "li",
          "s": "analytics e métricas de produto"
        },
        {
          "t": "li",
          "s": "mensuração de campanhas e conversões, quando aplicável"
        },
        {
          "t": "li",
          "s": "prevenção de fraudes e abusos"
        },
        {
          "t": "li",
          "s": "cumprimento de obrigações legais e regulatórias"
        },
        {
          "t": "h2",
          "s": "2.4 Cookies, SDKs e tecnologias similares"
        },
        {
          "t": "p",
          "s": "O Caminare utiliza, quando aplicável, cookies, SDKs, identificadores técnicos, pixels, tecnologias de armazenamento local e outras tecnologias similares para possibilitar o funcionamento da Plataforma, compreender sua utilização, medir seu desempenho e aprimorar nossos produtos e serviços."
        },
        {
          "t": "p",
          "s": "Essas tecnologias poderão ser utilizadas para:"
        },
        {
          "t": "li",
          "s": "funcionamento e operação da Plataforma"
        },
        {
          "t": "li",
          "s": "autenticação e gerenciamento de sessão"
        },
        {
          "t": "li",
          "s": "segurança e prevenção de fraudes e abusos"
        },
        {
          "t": "li",
          "s": "análise de desempenho e diagnóstico de falhas"
        },
        {
          "t": "li",
          "s": "analytics e mensuração de utilização do produto"
        },
        {
          "t": "li",
          "s": "compreensão de como os usuários utilizam as funcionalidades da Plataforma"
        },
        {
          "t": "li",
          "s": "desenvolvimento e aprimoramento do produto"
        },
        {
          "t": "li",
          "s": "mensuração de campanhas e conversões"
        },
        {
          "t": "li",
          "s": "atribuição de instalações, assinaturas e outras conversões de marketing, quando aplicável"
        },
        {
          "t": "li",
          "s": "campanhas institucionais e publicitárias, observadas as limitações descritas nesta Política"
        },
        {
          "t": "p",
          "s": "O Caminare poderá utilizar serviços de analytics e mensuração fornecidos por terceiros, incluindo Google Analytics for Firebase (GA4), bem como tecnologias de mensuração relacionadas ao Google Ads e ao Meta, conforme aplicável."
        },
        {
          "t": "p",
          "s": "Os eventos enviados para fins de analytics, mensuração de produto e mensuração de campanhas são estruturados para utilizar dados técnicos, operacionais e metadados necessários à mensuração. O Caminare não envia aos provedores de analytics ou publicidade, para essas finalidades, o conteúdo dos registros pessoais do usuário, incluindo textos, áudios, transcrições, emoções, pensamentos, crenças, padrões ou outras informações subjetivas inseridas ou geradas na Plataforma."
        },
        {
          "t": "p",
          "s": "O Caminare não utiliza remarketing baseado no conteúdo emocional dos registros, em crenças pessoais, pensamentos, emoções, padrões comportamentais ou outras inferências subjetivas do usuário."
        },
        {
          "t": "p",
          "s": "Nos dispositivos iOS, determinadas funcionalidades relacionadas à atribuição e mensuração de campanhas publicitárias poderão depender da autorização do usuário por meio do App Tracking Transparency (ATT) da Apple. O usuário poderá aceitar ou recusar essa autorização, conforme as opções apresentadas pelo sistema operacional. A recusa da autorização não impede o uso normal do Caminare."
        },
        {
          "t": "p",
          "s": "As informações coletadas por meio dessas tecnologias poderão ser compartilhadas com os respectivos provedores tecnológicos na medida necessária para as finalidades descritas nesta Política, observadas as regras sobre compartilhamento de dados e transferências internacionais previstas nesta Política."
        },
        {
          "t": "h",
          "s": "3. DADOS POTENCIALMENTE SENSÍVEIS"
        },
        {
          "t": "p",
          "s": "O conteúdo inserido voluntariamente pelo usuário pode envolver informações potencialmente sensíveis, incluindo dados relacionados a:"
        },
        {
          "t": "li",
          "s": "emoções"
        },
        {
          "t": "li",
          "s": "estado emocional"
        },
        {
          "t": "li",
          "s": "percepções subjetivas"
        },
        {
          "t": "li",
          "s": "crenças pessoais"
        },
        {
          "t": "li",
          "s": "padrões comportamentais"
        },
        {
          "t": "li",
          "s": "reflexões íntimas"
        },
        {
          "t": "p",
          "s": "O tratamento desses dados ocorre exclusivamente para viabilizar o funcionamento das funcionalidades solicitadas pelo próprio usuário dentro da Plataforma."
        },
        {
          "t": "p",
          "s": "O Caminare não possui finalidade clínica, médica, psicológica ou terapêutica."
        },
        {
          "t": "p",
          "s": "As inferências realizadas pela Plataforma possuem finalidade organizacional, informacional e de autoconhecimento pessoal."
        },
        {
          "t": "h",
          "s": "4. COMO UTILIZAMOS OS DADOS"
        },
        {
          "t": "p",
          "s": "Os dados pessoais e demais informações coletadas poderão ser utilizados, conforme aplicável, para as seguintes finalidades:"
        },
        {
          "t": "li",
          "s": "criação, manutenção e gerenciamento da conta"
        },
        {
          "t": "li",
          "s": "autenticação e gerenciamento de acesso"
        },
        {
          "t": "li",
          "s": "prestação e operação do Serviço"
        },
        {
          "t": "li",
          "s": "transcrição de áudio"
        },
        {
          "t": "li",
          "s": "organização de registros"
        },
        {
          "t": "li",
          "s": "identificação automatizada de emoções"
        },
        {
          "t": "li",
          "s": "identificação automatizada de pensamentos"
        },
        {
          "t": "li",
          "s": "sugestão de crenças subjacentes"
        },
        {
          "t": "li",
          "s": "identificação de padrões"
        },
        {
          "t": "li",
          "s": "geração de insights"
        },
        {
          "t": "li",
          "s": "exportação e compartilhamento de conteúdo, quando solicitado pelo usuário"
        },
        {
          "t": "li",
          "s": "suporte técnico e atendimento ao usuário"
        },
        {
          "t": "li",
          "s": "analytics e mensuração da utilização e do desempenho da Plataforma"
        },
        {
          "t": "li",
          "s": "análise de funcionamento e utilização das funcionalidades"
        },
        {
          "t": "li",
          "s": "diagnóstico e correção de falhas e problemas técnicos"
        },
        {
          "t": "li",
          "s": "segurança, prevenção de fraudes e prevenção de usos abusivos"
        },
        {
          "t": "li",
          "s": "melhoria, desenvolvimento e aprimoramento da Plataforma"
        },
        {
          "t": "li",
          "s": "mensuração de campanhas publicitárias e conversões, quando aplicável"
        },
        {
          "t": "li",
          "s": "atribuição e análise de desempenho de campanhas de marketing, quando aplicável"
        },
        {
          "t": "li",
          "s": "processamento de pagamentos e gerenciamento de assinaturas"
        },
        {
          "t": "li",
          "s": "cumprimento de obrigações legais e regulatórias"
        },
        {
          "t": "li",
          "s": "exercício regular de direitos"
        },
        {
          "t": "p",
          "s": "Os dados utilizados para analytics, mensuração de produto e mensuração de campanhas serão tratados de acordo com as disposições desta Política, incluindo as limitações relativas ao uso e compartilhamento do conteúdo dos registros pessoais do usuário descritas nos itens 2.3 e 2.4."
        },
        {
          "t": "h",
          "s": "5. INTELIGÊNCIA ARTIFICIAL E PROCESSAMENTO AUTOMATIZADO"
        },
        {
          "t": "p",
          "s": "O Caminare utiliza sistemas de inteligência artificial próprios e/ou de terceiros como componente central de funcionamento da Plataforma."
        },
        {
          "t": "p",
          "s": "Esses sistemas podem realizar processamento automatizado para:"
        },
        {
          "t": "li",
          "s": "transcrição"
        },
        {
          "t": "li",
          "s": "categorização"
        },
        {
          "t": "li",
          "s": "identificação de emoções"
        },
        {
          "t": "li",
          "s": "identificação de pensamentos"
        },
        {
          "t": "li",
          "s": "sugestão de crenças"
        },
        {
          "t": "li",
          "s": "organização de conteúdo"
        },
        {
          "t": "li",
          "s": "identificação de padrões"
        },
        {
          "t": "li",
          "s": "estruturação de registros"
        },
        {
          "t": "p",
          "s": "As inferências geradas pela Plataforma:"
        },
        {
          "t": "li",
          "s": "possuem natureza sugestiva"
        },
        {
          "t": "li",
          "s": "não constituem diagnóstico"
        },
        {
          "t": "li",
          "s": "não constituem avaliação clínica"
        },
        {
          "t": "li",
          "s": "não substituem avaliação humana"
        },
        {
          "t": "li",
          "s": "dependem de validação do próprio usuário"
        },
        {
          "t": "p",
          "s": "O usuário reconhece que sistemas de IA podem produzir resultados imprecisos, inconsistentes ou inadequados."
        },
        {
          "t": "p",
          "s": "O Caminare não realiza decisões automatizadas com efeitos jurídicos vinculantes sobre o usuário."
        },
        {
          "t": "h",
          "s": "6. DADOS ANONIMIZADOS E MELHORIA TECNOLÓGICA"
        },
        {
          "t": "p",
          "s": "O Caminare não utiliza dados identificáveis dos usuários para treinamento geral de modelos de inteligência artificial."
        },
        {
          "t": "p",
          "s": "Poderemos utilizar dados anonimizados, agregados ou estatísticos para:"
        },
        {
          "t": "li",
          "s": "analytics"
        },
        {
          "t": "li",
          "s": "melhoria tecnológica"
        },
        {
          "t": "li",
          "s": "desenvolvimento de funcionalidades"
        },
        {
          "t": "li",
          "s": "aprimoramento da Plataforma"
        },
        {
          "t": "li",
          "s": "pesquisa interna"
        },
        {
          "t": "li",
          "s": "melhoria de modelos e sistemas utilizados pelo Serviço"
        },
        {
          "t": "p",
          "s": "Sempre que aplicável, buscamos adotar medidas razoáveis destinadas à redução de riscos de reidentificação."
        },
        {
          "t": "h",
          "s": "7. COMPARTILHAMENTO DE DADOS"
        },
        {
          "t": "p",
          "s": "Os dados pessoais e demais informações tratados pelo Caminare poderão ser compartilhados, quando necessário e de acordo com as finalidades descritas nesta Política, com categorias de terceiros envolvidas na operação, segurança, suporte, mensuração e prestação dos serviços da Plataforma, incluindo:"
        },
        {
          "t": "li",
          "s": "provedores de infraestrutura e serviços de computação em nuvem"
        },
        {
          "t": "li",
          "s": "provedores de inteligência artificial"
        },
        {
          "t": "li",
          "s": "provedores de autenticação"
        },
        {
          "t": "li",
          "s": "provedores de analytics e mensuração, incluindo Google Analytics for Firebase (GA4)"
        },
        {
          "t": "li",
          "s": "provedores de mensuração e atribuição de campanhas publicitárias, incluindo Google Ads e Meta, quando aplicável"
        },
        {
          "t": "li",
          "s": "provedores de crash reporting e monitoramento técnico"
        },
        {
          "t": "li",
          "s": "processadores e provedores de pagamento"
        },
        {
          "t": "li",
          "s": "provedores de segurança"
        },
        {
          "t": "li",
          "s": "operadores técnicos"
        },
        {
          "t": "li",
          "s": "parceiros e fornecedores de tecnologia"
        },
        {
          "t": "li",
          "s": "outros prestadores de serviços necessários à operação da Plataforma"
        },
        {
          "t": "p",
          "s": "O compartilhamento poderá ocorrer na medida necessária para:"
        },
        {
          "t": "li",
          "s": "funcionamento e manutenção da Plataforma"
        },
        {
          "t": "li",
          "s": "prestação do Serviço"
        },
        {
          "t": "li",
          "s": "processamento e organização de dados"
        },
        {
          "t": "li",
          "s": "utilização dos serviços de inteligência artificial"
        },
        {
          "t": "li",
          "s": "autenticação e gerenciamento de acesso"
        },
        {
          "t": "li",
          "s": "analytics e mensuração de produto"
        },
        {
          "t": "li",
          "s": "mensuração e atribuição de campanhas e conversões, quando aplicável"
        },
        {
          "t": "li",
          "s": "segurança e prevenção de fraudes e abusos"
        },
        {
          "t": "li",
          "s": "diagnóstico e correção de falhas"
        },
        {
          "t": "li",
          "s": "suporte técnico e atendimento"
        },
        {
          "t": "li",
          "s": "processamento de pagamentos e gerenciamento de assinaturas"
        },
        {
          "t": "li",
          "s": "cumprimento de obrigações legais e regulatórias"
        },
        {
          "t": "p",
          "s": "Quando os dados forem compartilhados com provedores de analytics, mensuração ou publicidade para as finalidades descritas nos itens 2.3 e 2.4, o Caminare busca limitar o compartilhamento aos dados técnicos, operacionais e metadados necessários à mensuração. O conteúdo dos registros pessoais do usuário, incluindo textos, áudios, transcrições, emoções, pensamentos, crenças, padrões e outras informações subjetivas, não é compartilhado com esses provedores para fins de analytics ou publicidade."
        },
        {
          "t": "p",
          "s": "Os dados também poderão ser compartilhados:"
        },
        {
          "t": "li",
          "s": "quando exigido por lei ou regulamentação aplicável"
        },
        {
          "t": "li",
          "s": "mediante ordem ou determinação de autoridade competente"
        },
        {
          "t": "li",
          "s": "para o exercício regular de direitos"
        },
        {
          "t": "li",
          "s": "para prevenção ou investigação de fraudes, abusos ou incidentes de segurança"
        },
        {
          "t": "li",
          "s": "em operações societárias, incluindo reorganizações, fusões, aquisições, incorporações ou operações equivalentes"
        },
        {
          "t": "p",
          "s": "O compartilhamento com terceiros não implica autorização para que esses terceiros utilizem os dados para finalidades próprias incompatíveis com aquelas descritas nesta Política, ressalvadas as situações em que o terceiro atue como controlador independente e o respectivo tratamento esteja sujeito às suas próprias políticas e obrigações legais."
        },
        {
          "t": "h",
          "s": "8. TRANSFERÊNCIAS INTERNACIONAIS"
        },
        {
          "t": "p",
          "s": "O Caminare poderá utilizar fornecedores, infraestrutura ou serviços localizados fora do país do usuário."
        },
        {
          "t": "p",
          "s": "Como consequência, determinados dados poderão ser processados internacionalmente."
        },
        {
          "t": "p",
          "s": "Buscamos adotar medidas razoáveis compatíveis com a legislação aplicável para proteção dessas transferências, observadas as limitações técnicas e operacionais inerentes à infraestrutura global utilizada."
        },
        {
          "t": "h",
          "s": "9. RETENÇÃO E EXCLUSÃO DE DADOS"
        },
        {
          "t": "p",
          "s": "Os dados pessoais e demais informações poderão ser mantidos pelo período necessário para as finalidades descritas nesta Política, incluindo, conforme aplicável:"
        },
        {
          "t": "li",
          "s": "enquanto a conta permanecer ativa"
        },
        {
          "t": "li",
          "s": "durante o período necessário à prestação do Serviço"
        },
        {
          "t": "li",
          "s": "durante o período necessário para manutenção, segurança e funcionamento da Plataforma"
        },
        {
          "t": "li",
          "s": "para cumprimento de obrigações legais e regulatórias"
        },
        {
          "t": "li",
          "s": "para o exercício regular de direitos"
        },
        {
          "t": "li",
          "s": "para prevenção e investigação de fraudes, abusos e incidentes de segurança"
        },
        {
          "t": "li",
          "s": "para analytics, mensuração e melhoria da Plataforma, observados os períodos de retenção aplicáveis a cada tecnologia e serviço"
        },
        {
          "t": "li",
          "s": "por outros períodos quando houver fundamento legal para sua conservação"
        },
        {
          "t": "h2",
          "s": "9.1 Retenção de dados de analytics"
        },
        {
          "t": "p",
          "s": "Os dados coletados por meio de ferramentas de analytics e mensuração poderão estar sujeitos a períodos de retenção específicos definidos pelos respectivos provedores tecnológicos."
        },
        {
          "t": "p",
          "s": "No caso do Google Analytics for Firebase (GA4), os dados detalhados de analytics poderão ser mantidos pelo período de retenção configurado na ferramenta, atualmente de até 14 (quatorze) meses, conforme aplicável à configuração adotada pelo Caminare."
        },
        {
          "t": "p",
          "s": "Determinados dados de analytics poderão também ser exportados para ambientes de armazenamento e análise sob controle operacional do Caminare, como o Google BigQuery, para fins de análise histórica, mensuração, desenvolvimento e aprimoramento da Plataforma."
        },
        {
          "t": "p",
          "s": "Os dados exportados para esses ambientes poderão ser mantidos por período superior ao período de retenção da interface do GA4, inclusive por prazo indeterminado, quando tecnicamente necessário e juridicamente permitido, desde que tratados de acordo com as finalidades descritas nesta Política e, sempre que aplicável, de forma anonimizada, agregada ou estatística."
        },
        {
          "t": "p",
          "s": "Os dados utilizados exclusivamente para analytics, mensuração de produto e campanhas não incluem o conteúdo dos registros pessoais do usuário, conforme descrito nos itens 2.3 e 2.4."
        },
        {
          "t": "h2",
          "s": "9.2 Exclusão da conta"
        },
        {
          "t": "p",
          "s": "O usuário poderá solicitar a exclusão de sua conta pelos meios disponibilizados pela Plataforma."
        },
        {
          "t": "p",
          "s": "Após a solicitação de exclusão:"
        },
        {
          "t": "li",
          "s": "os dados operacionais associados à conta poderão ser removidos ou anonimizados, conforme aplicável"
        },
        {
          "t": "li",
          "s": "backups residuais poderão permanecer armazenados temporariamente por até 30 (trinta) dias"
        },
        {
          "t": "li",
          "s": "determinadas informações poderão ser mantidas quando exigido ou permitido pela legislação aplicável"
        },
        {
          "t": "li",
          "s": "dados de analytics previamente coletados poderão permanecer nos sistemas de analytics ou armazenamento histórico pelo período de retenção aplicável, especialmente quando não for tecnicamente possível vinculá-los diretamente à conta individual ou quando estiverem anonimizados ou agregados"
        },
        {
          "t": "p",
          "s": "A exclusão da conta não implica necessariamente a eliminação imediata de todos os registros técnicos, estatísticos, de segurança, auditoria ou analytics, quando sua retenção for necessária ou legalmente permitida para as finalidades descritas nesta Política."
        },
        {
          "t": "h",
          "s": "10. SEGURANÇA"
        },
        {
          "t": "p",
          "s": "Buscamos adotar medidas técnicas, administrativas e organizacionais razoáveis voltadas à proteção dos dados pessoais, incluindo controles compatíveis com a natureza da Plataforma e os riscos envolvidos."
        },
        {
          "t": "p",
          "s": "Essas medidas podem incluir, conforme aplicável:"
        },
        {
          "t": "li",
          "s": "controle de acesso"
        },
        {
          "t": "li",
          "s": "autenticação"
        },
        {
          "t": "li",
          "s": "monitoramento técnico"
        },
        {
          "t": "li",
          "s": "proteção de infraestrutura"
        },
        {
          "t": "li",
          "s": "criptografia em determinadas etapas"
        },
        {
          "t": "li",
          "s": "segregação de acessos"
        },
        {
          "t": "li",
          "s": "práticas de segurança compatíveis com padrões de mercado"
        },
        {
          "t": "p",
          "s": "Nenhum sistema tecnológico é completamente imune a riscos."
        },
        {
          "t": "p",
          "s": "Assim, apesar dos esforços razoáveis empregados, não podemos garantir segurança absoluta. Em caso de incidente de segurança que possa resultar em acesso não autorizado, destruição, perda, alteração, divulgação ou qualquer forma de tratamento inadequado de dados pessoais, a Empresa buscará adotar medidas razoáveis para contenção, investigação e mitigação dos impactos identificados. Quando exigido pela legislação aplicável ou quando o incidente puder gerar risco relevante aos usuários afetados, a Empresa poderá comunicar os usuários potencialmente impactados e as autoridades competentes, adotando, dentro de limites técnicos e operacionais razoáveis, as providências cabíveis para proteção dos dados e mitigação dos efeitos do incidente."
        },
        {
          "t": "h",
          "s": "11. DIREITOS DO TITULAR"
        },
        {
          "t": "p",
          "s": "Conforme a legislação aplicável, o usuário poderá solicitar, quando cabível:"
        },
        {
          "t": "li",
          "s": "confirmação do tratamento"
        },
        {
          "t": "li",
          "s": "acesso aos dados"
        },
        {
          "t": "li",
          "s": "correção de dados"
        },
        {
          "t": "li",
          "s": "atualização"
        },
        {
          "t": "li",
          "s": "anonimização"
        },
        {
          "t": "li",
          "s": "exclusão"
        },
        {
          "t": "li",
          "s": "portabilidade"
        },
        {
          "t": "li",
          "s": "informações sobre compartilhamento"
        },
        {
          "t": "li",
          "s": "revogação de consentimento, quando aplicável"
        },
        {
          "t": "li",
          "s": "oposição ao tratamento, nos casos previstos em lei"
        },
        {
          "t": "p",
          "s": "As solicitações poderão ser encaminhadas ao canal indicado nesta Política."
        },
        {
          "t": "h",
          "s": "12. EXPORTAÇÃO E COMPARTILHAMENTO PELO USUÁRIO"
        },
        {
          "t": "p",
          "s": "O Caminare poderá disponibilizar funcionalidades de exportação ou compartilhamento de conteúdo, incluindo:"
        },
        {
          "t": "li",
          "s": "PDF"
        },
        {
          "t": "li",
          "s": "Envio de texto"
        },
        {
          "t": "li",
          "s": "Compartilhamento nativo de texto"
        },
        {
          "t": "p",
          "s": "O compartilhamento realizado pelo próprio usuário ocorrerá sob sua exclusiva responsabilidade."
        },
        {
          "t": "p",
          "s": "A Empresa não controla nem se responsabiliza pelo tratamento realizado por terceiros após compartilhamento voluntário feito pelo usuário."
        },
        {
          "t": "h",
          "s": "13. CONTATO"
        },
        {
          "t": "p",
          "s": "Calíope Sociedade Unipessoal Ltda."
        },
        {
          "t": "p",
          "s": "CNPJ: 13.769.065/0001-48"
        },
        {
          "t": "p",
          "s": "Av. Mal. Rondon, 700, Sala 512P, Jardim Chapadão, Campinas/SP, CEP 13070-173"
        },
        {
          "t": "p",
          "s": "Contato geral: contato@caminare.com.br"
        },
        {
          "t": "p",
          "s": "Privacidade e proteção de dados: dpo@caminare.com.br"
        },
        {
          "t": "h",
          "s": "14. ALTERAÇÕES DESTA POLÍTICA"
        },
        {
          "t": "p",
          "s": "Esta Política poderá ser atualizada periodicamente."
        },
        {
          "t": "p",
          "s": "Quando exigido pela legislação aplicável ou quando as alterações forem materialmente relevantes, poderemos comunicar o usuário por meios razoáveis, incluindo:"
        },
        {
          "t": "li",
          "s": "e-mail"
        },
        {
          "t": "li",
          "s": "notificações na Plataforma"
        },
        {
          "t": "li",
          "s": "avisos institucionais"
        },
        {
          "t": "p",
          "s": "A continuidade de uso da Plataforma após a entrada em vigor das alterações poderá caracterizar aceitação da versão atualizada, observados os direitos legalmente aplicáveis."
        },
        {
          "t": "p",
          "s": "Muito obrigado."
        }
      ]
    },
    "en": {
      "title": "Privacy Policy",
      "updated": "Last updated: Aug 19, 2026",
      "blocks": [
        {
          "t": "p",
          "s": "Welcome to Caminare."
        },
        {
          "t": "p",
          "s": "Caminare was created to support people in their journey of self-awareness, and we understand how important privacy is in this context. For that reason, privacy, confidentiality, and security are not merely legal requirements for us — they are essential parts of our work."
        },
        {
          "t": "p",
          "s": "Calíope developed Caminare with the commitment to act ethically, transparently, and responsibly in the processing of personal data, especially considering the sensitive and subjective nature of many of the records created within the platform."
        },
        {
          "t": "p",
          "s": "We continuously seek to adopt practices aligned with modern standards of data protection, digital governance, and information security, always respecting applicable laws and users’ rights, while acting with respect, responsibility, and seriousness toward those who entrust us with their data."
        },
        {
          "t": "p",
          "s": "We are also committed to working with technology providers and partners that are internationally recognized for their strong reputation in security, privacy, reliability, and regulatory compliance. Our back-office infrastructure operates on global technology and infrastructure providers, as well as other widely recognized technology providers in the market."
        },
        {
          "t": "p",
          "s": "At the same time, we believe transparency is essential. For that reason, we aim to clearly explain what data may be processed, why such data is processed, how it may be used, and what measures we seek to adopt to protect it."
        },
        {
          "t": "p",
          "s": "Our goal is to allow users to use Caminare with clarity and confidence regarding how their privacy will be respected and how their information is handled."
        },
        {
          "t": "p",
          "s": "We recommend that you read this Privacy Policy in full, as by using Caminare, you acknowledge that you have read and understood this Policy."
        },
        {
          "t": "h",
          "s": "1. WHO MAY USE CAMINARE"
        },
        {
          "t": "p",
          "s": "Caminare is intended exclusively for individuals who are 18 (eighteen) years of age or older."
        },
        {
          "t": "p",
          "s": "Use by minors is not permitted."
        },
        {
          "t": "p",
          "s": "If we identify unauthorized use by a minor, the account may be suspended or terminated."
        },
        {
          "t": "h",
          "s": "2. WHAT DATA WE COLLECT"
        },
        {
          "t": "p",
          "s": "We may collect different categories of data depending on how the Platform is used."
        },
        {
          "t": "h2",
          "s": "2.1 Registration Data"
        },
        {
          "t": "p",
          "s": "This may include, as applicable:"
        },
        {
          "t": "li",
          "s": "name"
        },
        {
          "t": "li",
          "s": "email address"
        },
        {
          "t": "li",
          "s": "identifiers associated with Google or Apple login"
        },
        {
          "t": "li",
          "s": "authentication credentials"
        },
        {
          "t": "li",
          "s": "subscription-related information"
        },
        {
          "t": "h2",
          "s": "2.2 User-Submitted Content"
        },
        {
          "t": "p",
          "s": "Caminare is designed to allow users to voluntarily register and organize personal information."
        },
        {
          "t": "p",
          "s": "Such data may include:"
        },
        {
          "t": "li",
          "s": "free-form text"
        },
        {
          "t": "li",
          "s": "personal records"
        },
        {
          "t": "li",
          "s": "audio submitted for transcription"
        },
        {
          "t": "li",
          "s": "transcriptions"
        },
        {
          "t": "li",
          "s": "identified and/or validated emotions"
        },
        {
          "t": "li",
          "s": "identified and/or validated thoughts"
        },
        {
          "t": "li",
          "s": "suggested and/or adjusted beliefs"
        },
        {
          "t": "li",
          "s": "identified and/or validated patterns"
        },
        {
          "t": "li",
          "s": "tags"
        },
        {
          "t": "li",
          "s": "record history"
        },
        {
          "t": "li",
          "s": "reports and exports"
        },
        {
          "t": "p",
          "s": "Users are responsible for the content they choose to submit to the Platform."
        },
        {
          "t": "h2",
          "s": "2.3 Technical and Usage Data"
        },
        {
          "t": "p",
          "s": "We may automatically collect certain technical and usage data related to the use of the Platform, including, where applicable:"
        },
        {
          "t": "li",
          "s": "IP address"
        },
        {
          "t": "li",
          "s": "technical or device identifiers"
        },
        {
          "t": "li",
          "s": "device model and characteristics"
        },
        {
          "t": "li",
          "s": "operating system"
        },
        {
          "t": "li",
          "s": "application version"
        },
        {
          "t": "li",
          "s": "language and regional settings"
        },
        {
          "t": "li",
          "s": "technical logs"
        },
        {
          "t": "li",
          "s": "session information"
        },
        {
          "t": "li",
          "s": "information regarding navigation and interaction with the Platform"
        },
        {
          "t": "li",
          "s": "data relating to application performance and operation"
        },
        {
          "t": "li",
          "s": "crash reports"
        },
        {
          "t": "li",
          "s": "analytics and usage measurement data"
        },
        {
          "t": "li",
          "s": "information regarding events and actions performed on the Platform"
        },
        {
          "t": "p",
          "s": "Analytics and measurement data may include information about events such as Account creation and access, login, start and conversion of the free trial period, plan views, subscription purchases and renewals, use of functionalities, record creation, usage milestones, access to history, insights and summaries, content export or sharing, device permissions, technical failures, and other events necessary to analyze the operation and performance of the Platform."
        },
        {
          "t": "p",
          "s": "When used for analytics, product measurement, or campaign measurement, these events may use metadata and operational information, such as event type, input type (text or voice), record number or count, subscription plan, billing period, conversion-related information, status of certain operations, and technical information necessary for measurement."
        },
        {
          "t": "p",
          "s": "User record content, including texts, audio, transcriptions, emotions, thoughts, beliefs, patterns, and other subjective information entered or generated in connection with the use of Caminare, is not sent to analytics or advertising providers as part of these measurement events."
        },
        {
          "t": "p",
          "s": "Technical and usage data may be used for:"
        },
        {
          "t": "li",
          "s": "operation and maintenance of the Platform"
        },
        {
          "t": "li",
          "s": "security"
        },
        {
          "t": "li",
          "s": "troubleshooting and failure diagnosis"
        },
        {
          "t": "li",
          "s": "performance analysis"
        },
        {
          "t": "li",
          "s": "understanding the use of functionalities"
        },
        {
          "t": "li",
          "s": "improving the user experience"
        },
        {
          "t": "li",
          "s": "product development and enhancement"
        },
        {
          "t": "li",
          "s": "analytics and product metrics"
        },
        {
          "t": "li",
          "s": "campaign and conversion measurement, where applicable"
        },
        {
          "t": "li",
          "s": "fraud and abuse prevention"
        },
        {
          "t": "li",
          "s": "compliance with legal and regulatory obligations"
        },
        {
          "t": "h2",
          "s": "2.4 Cookies, SDKs and Similar Technologies"
        },
        {
          "t": "p",
          "s": "Caminare uses, where applicable, cookies, SDKs, technical identifiers, pixels, local storage technologies, and other similar technologies to enable the operation of the Platform, understand how it is used, measure its performance, and improve our products and services."
        },
        {
          "t": "p",
          "s": "These technologies may be used for:"
        },
        {
          "t": "li",
          "s": "operation and functionality of the Platform"
        },
        {
          "t": "li",
          "s": "authentication and session management"
        },
        {
          "t": "li",
          "s": "security and prevention of fraud and abuse"
        },
        {
          "t": "li",
          "s": "performance analysis and failure diagnosis"
        },
        {
          "t": "li",
          "s": "product analytics and usage measurement"
        },
        {
          "t": "li",
          "s": "understanding how users interact with the Platform’s features"
        },
        {
          "t": "li",
          "s": "product development and enhancement"
        },
        {
          "t": "li",
          "s": "campaign and conversion measurement"
        },
        {
          "t": "li",
          "s": "attribution of app installations, subscriptions, and other marketing conversions, where applicable"
        },
        {
          "t": "li",
          "s": "institutional and advertising campaigns, subject to the limitations described in this Privacy Policy"
        },
        {
          "t": "p",
          "s": "Caminare may use analytics and measurement services provided by third parties, including Google Analytics for Firebase (GA4), as well as measurement technologies associated with Google Ads and Meta, where applicable."
        },
        {
          "t": "p",
          "s": "Events sent for analytics, product measurement, and campaign measurement purposes are designed to use the technical, operational, and metadata information necessary for measurement. Caminare does not send users’ personal record content to analytics or advertising providers for these purposes, including texts, audio, transcriptions, emotions, thoughts, beliefs, patterns, or other subjective information entered or generated within the Platform."
        },
        {
          "t": "p",
          "s": "Caminare does not use remarketing based on the emotional content of users’ records, personal beliefs, thoughts, emotions, behavioral patterns, or other subjective inferences about users."
        },
        {
          "t": "p",
          "s": "On iOS devices, certain functionalities related to advertising attribution and campaign measurement may depend on the user’s authorization through Apple’s App Tracking Transparency (ATT) framework. Users may grant or deny such authorization according to the options presented by the operating system. Denying authorization does not prevent normal use of Caminare."
        },
        {
          "t": "p",
          "s": "Information collected through these technologies may be shared with the relevant technology providers to the extent necessary for the purposes described in this Privacy Policy, subject to the data-sharing and international data-transfer provisions set forth herein."
        },
        {
          "t": "h",
          "s": "3. POTENTIALLY SENSITIVE DATA"
        },
        {
          "t": "p",
          "s": "Content voluntarily submitted by users may involve potentially sensitive information, including data related to:"
        },
        {
          "t": "li",
          "s": "emotions"
        },
        {
          "t": "li",
          "s": "emotional state"
        },
        {
          "t": "li",
          "s": "subjective perceptions"
        },
        {
          "t": "li",
          "s": "personal beliefs"
        },
        {
          "t": "li",
          "s": "behavioral patterns"
        },
        {
          "t": "li",
          "s": "intimate reflections"
        },
        {
          "t": "p",
          "s": "Such data is processed exclusively to enable the operation of functionalities specifically requested by the user within the Platform."
        },
        {
          "t": "p",
          "s": "Caminare has no clinical, medical, psychological, or therapeutic purpose."
        },
        {
          "t": "p",
          "s": "Any inferences generated by the Platform are intended solely for organizational, informational, and personal self-awareness purposes."
        },
        {
          "t": "h",
          "s": "4. HOW WE USE DATA"
        },
        {
          "t": "p",
          "s": "Personal data and other information collected may be used, where applicable, for the following purposes:"
        },
        {
          "t": "li",
          "s": "creating, maintaining, and managing the Account"
        },
        {
          "t": "li",
          "s": "authentication and access management"
        },
        {
          "t": "li",
          "s": "providing and operating the Service"
        },
        {
          "t": "li",
          "s": "audio transcription"
        },
        {
          "t": "li",
          "s": "organizing records"
        },
        {
          "t": "li",
          "s": "automated identification of emotions"
        },
        {
          "t": "li",
          "s": "automated identification of thoughts"
        },
        {
          "t": "li",
          "s": "suggesting underlying beliefs"
        },
        {
          "t": "li",
          "s": "identifying patterns"
        },
        {
          "t": "li",
          "s": "generating insights"
        },
        {
          "t": "li",
          "s": "exporting and sharing content, when requested by the User"
        },
        {
          "t": "li",
          "s": "technical support and user assistance"
        },
        {
          "t": "li",
          "s": "analytics and measurement of Platform usage and performance"
        },
        {
          "t": "li",
          "s": "analyzing the operation and use of Platform features"
        },
        {
          "t": "li",
          "s": "diagnosing and resolving technical failures and issues"
        },
        {
          "t": "li",
          "s": "security, fraud prevention, and prevention of abusive use"
        },
        {
          "t": "li",
          "s": "improving, developing, and enhancing the Platform"
        },
        {
          "t": "li",
          "s": "measuring advertising campaigns and conversions, where applicable"
        },
        {
          "t": "li",
          "s": "attribution and performance analysis of marketing campaigns, where applicable"
        },
        {
          "t": "li",
          "s": "payment processing and subscription management"
        },
        {
          "t": "li",
          "s": "compliance with legal and regulatory obligations"
        },
        {
          "t": "li",
          "s": "exercising and defending legal rights"
        },
        {
          "t": "p",
          "s": "Data used for analytics, product measurement, and campaign measurement will be processed in accordance with this Privacy Policy, including the limitations concerning the use and sharing of users’ personal record content described in Sections 2.3 and 2.4."
        },
        {
          "t": "h",
          "s": "5. ARTIFICIAL INTELLIGENCE AND AUTOMATED PROCESSING"
        },
        {
          "t": "p",
          "s": "Caminare uses proprietary and/or third-party artificial intelligence systems as a core component of the Platform."
        },
        {
          "t": "p",
          "s": "These systems may perform automated processing for:"
        },
        {
          "t": "li",
          "s": "transcription"
        },
        {
          "t": "li",
          "s": "categorization"
        },
        {
          "t": "li",
          "s": "identification of emotions"
        },
        {
          "t": "li",
          "s": "identification of thoughts"
        },
        {
          "t": "li",
          "s": "belief suggestion"
        },
        {
          "t": "li",
          "s": "content organization"
        },
        {
          "t": "li",
          "s": "pattern identification"
        },
        {
          "t": "li",
          "s": "structuring of records"
        },
        {
          "t": "p",
          "s": "The inferences generated by the Platform:"
        },
        {
          "t": "li",
          "s": "are suggestive in nature"
        },
        {
          "t": "li",
          "s": "do not constitute diagnosis"
        },
        {
          "t": "li",
          "s": "do not constitute clinical evaluation"
        },
        {
          "t": "li",
          "s": "do not replace human evaluation"
        },
        {
          "t": "li",
          "s": "depend on validation by the user"
        },
        {
          "t": "p",
          "s": "Users acknowledge that AI systems may generate inaccurate, inconsistent, or inappropriate outputs."
        },
        {
          "t": "p",
          "s": "Caminare does not make automated decisions producing legally binding effects on users."
        },
        {
          "t": "h",
          "s": "6. ANONYMIZED DATA AND TECHNOLOGICAL IMPROVEMENT"
        },
        {
          "t": "p",
          "s": "Caminare does not use identifiable user data for general artificial intelligence model training."
        },
        {
          "t": "p",
          "s": "We may use anonymized, aggregated, or statistical data for:"
        },
        {
          "t": "li",
          "s": "analytics"
        },
        {
          "t": "li",
          "s": "technological improvement"
        },
        {
          "t": "li",
          "s": "feature development"
        },
        {
          "t": "li",
          "s": "Platform enhancement"
        },
        {
          "t": "li",
          "s": "internal research"
        },
        {
          "t": "li",
          "s": "improvement of models and systems used by the Service"
        },
        {
          "t": "p",
          "s": "Where applicable, we seek to adopt reasonable measures aimed at reducing re-identification risks."
        },
        {
          "t": "h",
          "s": "7. DATA SHARING"
        },
        {
          "t": "p",
          "s": "Personal data and other information processed by Caminare may be shared, where necessary and in accordance with the purposes described in this Privacy Policy, with categories of third parties involved in the operation, security, support, measurement, and provision of the Platform, including:"
        },
        {
          "t": "li",
          "s": "cloud infrastructure and computing service providers"
        },
        {
          "t": "li",
          "s": "artificial intelligence providers"
        },
        {
          "t": "li",
          "s": "authentication providers"
        },
        {
          "t": "li",
          "s": "analytics and measurement providers, including Google Analytics for Firebase (GA4)"
        },
        {
          "t": "li",
          "s": "advertising campaign measurement and attribution providers, including Google Ads and Meta, where applicable"
        },
        {
          "t": "li",
          "s": "crash reporting and technical monitoring providers"
        },
        {
          "t": "li",
          "s": "payment processors and payment service providers"
        },
        {
          "t": "li",
          "s": "security providers"
        },
        {
          "t": "li",
          "s": "technical operators"
        },
        {
          "t": "li",
          "s": "technology partners and technology service providers"
        },
        {
          "t": "li",
          "s": "other service providers necessary for the operation of the Platform"
        },
        {
          "t": "p",
          "s": "Data may be shared to the extent necessary for:"
        },
        {
          "t": "li",
          "s": "operation and maintenance of the Platform"
        },
        {
          "t": "li",
          "s": "provision of the Service"
        },
        {
          "t": "li",
          "s": "data processing and organization"
        },
        {
          "t": "li",
          "s": "use of artificial intelligence services"
        },
        {
          "t": "li",
          "s": "authentication and access management"
        },
        {
          "t": "li",
          "s": "product analytics and measurement"
        },
        {
          "t": "li",
          "s": "campaign and conversion measurement and attribution, where applicable"
        },
        {
          "t": "li",
          "s": "security and prevention of fraud and abuse"
        },
        {
          "t": "li",
          "s": "diagnosis and resolution of technical failures"
        },
        {
          "t": "li",
          "s": "technical support and user assistance"
        },
        {
          "t": "li",
          "s": "payment processing and subscription management"
        },
        {
          "t": "li",
          "s": "compliance with legal and regulatory obligations"
        },
        {
          "t": "p",
          "s": "When data is shared with analytics, measurement, or advertising providers for the purposes described in Sections 2.3 and 2.4, Caminare seeks to limit such sharing to the technical, operational, and metadata information necessary for measurement. Users’ personal record content, including texts, audio, transcriptions, emotions, thoughts, beliefs, patterns, and other subjective information, is not shared with such providers for analytics or advertising purposes."
        },
        {
          "t": "p",
          "s": "Data may also be shared:"
        },
        {
          "t": "li",
          "s": "where required by applicable law or regulation"
        },
        {
          "t": "li",
          "s": "pursuant to an order or determination by a competent authority"
        },
        {
          "t": "li",
          "s": "for the exercise and defense of legal rights"
        },
        {
          "t": "li",
          "s": "for the prevention or investigation of fraud, abuse, or security incidents"
        },
        {
          "t": "li",
          "s": "in corporate transactions, including reorganizations, mergers, acquisitions, consolidations, or equivalent transactions"
        },
        {
          "t": "p",
          "s": "Sharing data with third parties does not authorize such third parties to use the data for their own purposes that are incompatible with those described in this Privacy Policy, except where a third party acts as an independent data controller and its processing is subject to its own policies and legal obligations."
        },
        {
          "t": "h",
          "s": "8. INTERNATIONAL DATA TRANSFERS"
        },
        {
          "t": "p",
          "s": "Caminare may use providers, infrastructure, or services located outside the user’s country of residence."
        },
        {
          "t": "p",
          "s": "As a result, certain data may be processed internationally."
        },
        {
          "t": "p",
          "s": "We seek to adopt reasonable measures compatible with applicable law to protect such transfers, subject to the technical and operational limitations inherent to the global infrastructure used by the Platform."
        },
        {
          "t": "h",
          "s": "9. DATA RETENTION AND DELETION"
        },
        {
          "t": "p",
          "s": "Personal data and other information may be retained for as long as necessary to fulfill the purposes described in this Privacy Policy, including, where applicable:"
        },
        {
          "t": "li",
          "s": "while the account remains active"
        },
        {
          "t": "li",
          "s": "for the period necessary to provide the Service"
        },
        {
          "t": "li",
          "s": "for the period necessary to maintain the security and operation of the Platform"
        },
        {
          "t": "li",
          "s": "to comply with legal and regulatory obligations"
        },
        {
          "t": "li",
          "s": "for the exercise and defense of legal rights"
        },
        {
          "t": "li",
          "s": "for the prevention and investigation of fraud, abuse, and security incidents"
        },
        {
          "t": "li",
          "s": "for analytics, measurement, and improvement of the Platform, subject to the retention periods applicable to each technology and service"
        },
        {
          "t": "li",
          "s": "for other periods where there is a lawful basis for retention"
        },
        {
          "t": "h2",
          "s": "9.1 Analytics Data Retention"
        },
        {
          "t": "p",
          "s": "Data collected through analytics and measurement tools may be subject to specific retention periods established by the respective technology providers."
        },
        {
          "t": "p",
          "s": "For Google Analytics for Firebase (GA4), detailed analytics data may be retained for the retention period configured in the tool, currently up to 14 (fourteen) months, as applicable to the configuration adopted by Caminare."
        },
        {
          "t": "p",
          "s": "Certain analytics data may also be exported to storage and analytics environments under Caminare’s operational control, such as Google BigQuery, for purposes including historical analysis, measurement, development, and improvement of the Platform."
        },
        {
          "t": "p",
          "s": "Data exported to such environments may be retained for longer than the retention period applicable within the GA4 interface, including for an indefinite period, where technically necessary and legally permitted, provided that such data is processed in accordance with the purposes described in this Privacy Policy and, where applicable, in anonymized, aggregated, or statistical form."
        },
        {
          "t": "p",
          "s": "Data used exclusively for analytics, product measurement, and campaign measurement does not include users’ personal record content, as described in Sections 2.3 and 2.4."
        },
        {
          "t": "h2",
          "s": "9.2 Account Deletion"
        },
        {
          "t": "p",
          "s": "Users may request deletion of their account through the means made available by the Platform."
        },
        {
          "t": "p",
          "s": "Following an account deletion request:"
        },
        {
          "t": "li",
          "s": "operational data associated with the account may be deleted or anonymized, as applicable"
        },
        {
          "t": "li",
          "s": "residual backups may remain temporarily stored for up to 30 (thirty) days"
        },
        {
          "t": "li",
          "s": "certain information may be retained where required or permitted by applicable law"
        },
        {
          "t": "li",
          "s": "previously collected analytics data may remain in analytics or historical storage systems for the applicable retention period, particularly where such data can no longer be technically linked directly to an individual account or where it has been anonymized or aggregated"
        },
        {
          "t": "p",
          "s": "Deletion of an account does not necessarily result in the immediate deletion of all technical, statistical, security, audit, or analytics records where their retention is necessary or legally permitted for the purposes described in this Privacy Policy."
        },
        {
          "t": "h",
          "s": "10. SECURITY"
        },
        {
          "t": "p",
          "s": "We seek to adopt reasonable technical, administrative, and organizational measures aimed at protecting personal data, including controls compatible with the nature of the Platform and the risks involved."
        },
        {
          "t": "p",
          "s": "Such measures may include, where applicable:"
        },
        {
          "t": "li",
          "s": "access controls"
        },
        {
          "t": "li",
          "s": "authentication mechanisms"
        },
        {
          "t": "li",
          "s": "technical monitoring"
        },
        {
          "t": "li",
          "s": "infrastructure protection"
        },
        {
          "t": "li",
          "s": "encryption at certain stages"
        },
        {
          "t": "li",
          "s": "access segregation"
        },
        {
          "t": "li",
          "s": "security practices compatible with market standards"
        },
        {
          "t": "p",
          "s": "No technological system is entirely immune to risk."
        },
        {
          "t": "p",
          "s": "Accordingly, despite the reasonable efforts employed, we cannot guarantee absolute security."
        },
        {
          "t": "p",
          "s": "In the event of a security incident that may result in unauthorized access, destruction, loss, alteration, disclosure, or any form of improper processing of personal data, the Company will seek to adopt reasonable measures for containment, investigation, and mitigation of identified impacts. Where required by applicable law or where the incident may create relevant risk to affected users, the Company may notify potentially impacted users and competent authorities, adopting, within reasonable technical and operational limits, the appropriate measures to protect data and mitigate the effects of the incident."
        },
        {
          "t": "h",
          "s": "11. DATA SUBJECT RIGHTS"
        },
        {
          "t": "p",
          "s": "In accordance with applicable law, users may request, where applicable:"
        },
        {
          "t": "li",
          "s": "confirmation of data processing"
        },
        {
          "t": "li",
          "s": "access to personal data"
        },
        {
          "t": "li",
          "s": "correction of inaccurate data"
        },
        {
          "t": "li",
          "s": "updating of data"
        },
        {
          "t": "li",
          "s": "anonymization"
        },
        {
          "t": "li",
          "s": "deletion"
        },
        {
          "t": "li",
          "s": "data portability"
        },
        {
          "t": "li",
          "s": "information regarding data sharing"
        },
        {
          "t": "li",
          "s": "withdrawal of consent, where applicable"
        },
        {
          "t": "li",
          "s": "objection to processing, where legally permitted"
        },
        {
          "t": "p",
          "s": "Requests may be submitted through the contact channels indicated in this Privacy Policy."
        },
        {
          "t": "h",
          "s": "12. USER EXPORT AND SHARING"
        },
        {
          "t": "p",
          "s": "Caminare may provide content export and sharing functionalities, including:"
        },
        {
          "t": "li",
          "s": "PDF export"
        },
        {
          "t": "li",
          "s": "native text sharing"
        },
        {
          "t": "li",
          "s": "text copy functionality"
        },
        {
          "t": "p",
          "s": "Any sharing performed by the user occurs under the user’s sole responsibility."
        },
        {
          "t": "p",
          "s": "The Company does not control and is not responsible for how third parties process, store, use, or redistribute information voluntarily shared by the user."
        },
        {
          "t": "h",
          "s": "13. CONTACT"
        },
        {
          "t": "p",
          "s": "Calíope Sociedade Unipessoal Ltda."
        },
        {
          "t": "p",
          "s": "CNPJ: 13.769.065/0001-48"
        },
        {
          "t": "p",
          "s": "Av. Mal. Rondon, 700, Sala 512P, Jardim Chapadão"
        },
        {
          "t": "p",
          "s": "Campinas/SP,"
        },
        {
          "t": "p",
          "s": "ZIP Code 13070-173"
        },
        {
          "t": "p",
          "s": "Brazil"
        },
        {
          "t": "p",
          "s": "General contact: contato@caminare.com.br"
        },
        {
          "t": "p",
          "s": "Privacy and data protection: dpo@caminare.com.br"
        },
        {
          "t": "h",
          "s": "14. CHANGES TO THIS POLICY"
        },
        {
          "t": "p",
          "s": "This Privacy Policy may be updated periodically."
        },
        {
          "t": "p",
          "s": "Where required by applicable law, or where changes are materially relevant, we may notify users through reasonable means, including:"
        },
        {
          "t": "li",
          "s": "email"
        },
        {
          "t": "li",
          "s": "in-platform notifications"
        },
        {
          "t": "li",
          "s": "institutional notices"
        },
        {
          "t": "p",
          "s": "Continued use of the Platform after the effective date of any updated version may constitute acceptance of the revised Policy, subject to legally applicable rights."
        },
        {
          "t": "p",
          "s": "Thank you for being part of this."
        }
      ]
    }
  }
};
