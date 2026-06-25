import { useTranslation } from 'react-i18next';
import { LegalView } from './LegalScreen';
import { deleteAccountDocs } from '../content/deleteAccount';

// Página pública /excluir-conta (sem login), exigida pelas lojas.
// Estática e informativa: não chama nenhuma API autenticada.
export function DeleteAccountScreen() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'pt-BR';
  return <LegalView doc={deleteAccountDocs[lang]} />;
}
