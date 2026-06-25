// Conteúdo da página pública de exclusão de conta (/excluir-conta),
// exigida pela Google Play e pela Apple App Store. Página estática e
// informativa: NÃO depende de login nem chama APIs autenticadas.
//
// Reaproveita o tipo LegalDoc para renderizar com o mesmo estilo das
// páginas de Termos e Privacidade (LegalView).
import type { LegalDoc } from './legal';

export const deleteAccountDocs: Record<'pt-BR' | 'en', LegalDoc> = {
  'pt-BR': {
    title: 'Exclusão de conta',
    updated: 'Última atualização: 25/06/2026',
    blocks: [
      {
        t: 'p',
        s: 'Esta página explica como excluir permanentemente a sua conta do Caminare e quais dados são removidos. A exclusão é definitiva e não pode ser desfeita.',
      },

      { t: 'h', s: 'Como excluir sua conta pelo aplicativo' },
      {
        t: 'p',
        s: 'A forma recomendada de excluir sua conta é diretamente pelo aplicativo Caminare, onde você está autenticado. Basta seguir os passos abaixo:',
      },
      { t: 'li', s: 'Abra o aplicativo Caminare e faça login na sua conta.' },
      { t: 'li', s: 'Toque em "Perfil" para acessar a tela do seu perfil.' },
      { t: 'li', s: 'Desça até o final da tela, até a área de exclusão de conta.' },
      { t: 'li', s: 'Toque em "Excluir conta".' },
      {
        t: 'li',
        s: 'Para confirmar, digite a palavra "DELETAR" quando solicitado e confirme a operação.',
      },
      {
        t: 'p',
        s: 'Após a confirmação, sua conta e os dados associados são excluídos de forma definitiva.',
      },

      { t: 'h', s: 'Quais dados são excluídos' },
      {
        t: 'p',
        s: 'Ao excluir sua conta, removemos os dados pessoais associados a ela na plataforma, incluindo:',
      },
      { t: 'li', s: 'Sua conta de acesso e os dados do perfil (nome, e-mail e preferências).' },
      { t: 'li', s: 'Seus registros (entradas/relatos) criados no aplicativo.' },
      { t: 'li', s: 'As emoções identificadas e validadas a partir dos seus registros.' },
      { t: 'li', s: 'As crenças sugeridas e ajustadas a partir dos seus registros.' },
      { t: 'li', s: 'Os padrões identificados a partir do seu histórico.' },
      { t: 'li', s: 'Os dados da sua assinatura associados ao seu perfil no aplicativo.' },

      { t: 'h', s: 'O que pode ser mantido' },
      {
        t: 'p',
        s: 'Compras e assinaturas feitas pela Apple App Store ou pela Google Play são processadas e armazenadas por essas lojas, e não pelo Caminare. Registros mínimos de transação podem ser mantidos pela Apple e pelo Google para cumprir obrigações legais, fiscais e contábeis, pelo prazo exigido pela legislação aplicável. Esses registros ficam sob controle das lojas, não do aplicativo.',
      },
      {
        t: 'p',
        s: 'O Caminare também poderá reter, de forma limitada, informações estritamente necessárias para cumprir obrigações legais, prevenir fraudes ou resolver disputas, pelo prazo exigido por lei. Para detalhes, consulte a nossa Política de Privacidade.',
      },

      { t: 'h', s: 'Não consegue acessar o aplicativo?' },
      {
        t: 'p',
        s: 'Se você não conseguir acessar sua conta para concluir a exclusão pelo aplicativo, envie um e-mail para hiagocreaty.fy@gmail.com solicitando a exclusão da sua conta. Para que possamos localizar e validar sua conta, envie a mensagem a partir do mesmo e-mail cadastrado no Caminare e informe que deseja excluir sua conta.',
      },
    ],
  },

  en: {
    title: 'Account deletion',
    updated: 'Last updated: June 25, 2026',
    blocks: [
      {
        t: 'p',
        s: 'This page explains how to permanently delete your Caminare account and which data is removed. Deletion is permanent and cannot be undone.',
      },

      { t: 'h', s: 'How to delete your account from the app' },
      {
        t: 'p',
        s: 'The recommended way to delete your account is directly in the Caminare app, where you are signed in. Just follow the steps below:',
      },
      { t: 'li', s: 'Open the Caminare app and sign in to your account.' },
      { t: 'li', s: 'Tap "Profile" to open your profile screen.' },
      { t: 'li', s: 'Scroll to the bottom of the screen, to the account deletion area.' },
      { t: 'li', s: 'Tap "Delete account".' },
      {
        t: 'li',
        s: 'To confirm, type the word "DELETAR" when prompted and confirm the operation.',
      },
      {
        t: 'p',
        s: 'After confirmation, your account and its associated data are permanently deleted.',
      },

      { t: 'h', s: 'What data is deleted' },
      {
        t: 'p',
        s: 'When you delete your account, we remove the personal data associated with it on the platform, including:',
      },
      { t: 'li', s: 'Your login account and profile data (name, email, and preferences).' },
      { t: 'li', s: 'Your entries (records/reflections) created in the app.' },
      { t: 'li', s: 'The emotions identified and validated from your entries.' },
      { t: 'li', s: 'The beliefs suggested and adjusted from your entries.' },
      { t: 'li', s: 'The patterns identified from your history.' },
      { t: 'li', s: 'Your subscription data associated with your profile in the app.' },

      { t: 'h', s: 'What may be retained' },
      {
        t: 'p',
        s: 'Purchases and subscriptions made through the Apple App Store or Google Play are processed and stored by those stores, not by Caminare. Minimal transaction records may be kept by Apple and Google to comply with legal, tax, and accounting obligations, for the period required by applicable law. These records are controlled by the stores, not by the app.',
      },
      {
        t: 'p',
        s: 'Caminare may also retain, on a limited basis, information strictly necessary to comply with legal obligations, prevent fraud, or resolve disputes, for the period required by law. For details, please see our Privacy Policy.',
      },

      { t: 'h', s: 'Cannot access the app?' },
      {
        t: 'p',
        s: 'If you are unable to access your account to complete the deletion from the app, send an email to hiagocreaty.fy@gmail.com requesting the deletion of your account. So that we can locate and verify your account, please send the message from the same email registered with Caminare and state that you want to delete your account.',
      },
    ],
  },
};
