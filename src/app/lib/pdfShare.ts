// =============================================================================
// Caminare — Exportar/compartilhar PDF no app NATIVO (Capacitor)
// -----------------------------------------------------------------------------
// No webview do Capacitor o download por <a download>/blob e o navigator.share
// NÃO funcionam como no navegador. Aqui salvamos o PDF com @capacitor/filesystem
// e abrimos a folha de compartilhamento nativa com @capacitor/share (que também
// permite "Salvar em Arquivos"/Drive). No web esta camada não é usada — a tela
// mantém o caminho do navegador (ver SummaryScreen).
// =============================================================================

/** Converte um Blob em base64 puro (sem o prefixo data:...;base64,). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = typeof reader.result === 'string' ? reader.result : '';
      const comma = res.indexOf(',');
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler o PDF.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Salva o PDF no armazenamento do app (cache) e devolve o URI do arquivo.
 * Cache é o diretório melhor suportado pelo FileProvider do @capacitor/share.
 */
export async function savePdfToDevice(blob: Blob, filename: string): Promise<string> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const data = await blobToBase64(blob);
  const res = await Filesystem.writeFile({
    path: filename,
    data,
    directory: Directory.Cache,
    recursive: true,
  });
  return res.uri;
}

/**
 * Salva o PDF e abre a folha de compartilhamento nativa (compartilhar OU salvar
 * em Arquivos/Drive). Usado tanto pelo "Baixar PDF" quanto pelo "Compartilhar"
 * no nativo. Relança o erro pra UI dar feedback; cancelamento do usuário é
 * tratado como sucesso silencioso.
 */
export async function sharePdfNative(
  blob: Blob,
  filename: string,
  opts: { title: string; text: string; dialogTitle: string }
): Promise<void> {
  const uri = await savePdfToDevice(blob, filename);
  const { Share } = await import('@capacitor/share');
  try {
    await Share.share({
      title: opts.title,
      text: opts.text,
      url: uri,
      dialogTitle: opts.dialogTitle,
    });
  } catch (err) {
    // Usuário cancelou a folha de compartilhamento → não é erro.
    const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    if (msg.includes('cancel') || msg.includes('abort') || msg.includes('dismiss')) return;
    throw err;
  }
}
