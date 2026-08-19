# Publicação 3.1.0 — textos prontos e passo a passo

Tudo aqui é pra colar direto nas lojas. O envio só destrava depois que o Ricardo
aceitar o contrato atualizado da Apple (aviso amarelo no App Store Connect). Até
lá, dá pra deixar todos os campos preenchidos; só não clica em "Enviar para análise".

---

## 0. Bloqueio a resolver primeiro (Ricardo)

Titular da conta Apple precisa aceitar o contrato atualizado do Developer Program:
developer.apple.com/account → aviso no topo ou seção Agreements → revisar e aceitar.
Sem isso a Apple não deixa enviar a atualização.

---

## 1. Nome do app (opcional, se for trocar)

- Português: `Caminare - Autoconhecimento`
- Inglês: `Caminare - Self-Knowledge`

Observação: no App Store Connect o nome tem limite de 30 caracteres. Se preferir
manter só "Caminare" no nome e usar a linha de baixo como subtítulo, dá certo também:
- Subtítulo PT: `Autoconhecimento e reflexão`
- Subtítulo EN: `Self-knowledge and reflection`

---

## 2. URLs (trocar de vercel para o domínio oficial)

- Política de privacidade: `https://www.caminare.com.br/privacidade`
- Termos: `https://www.caminare.com.br/termos`
- Suporte / site: `https://www.caminare.com.br`

Trocar tanto no App Store Connect quanto na Play Console.

---

## 3. Notas da versão ("Novidades desta versão")

### Português

Nesta atualização:
- Agora você escolhe seu idioma nativo. Suas emoções, crenças e padrões aparecem no idioma dos seus registros, não no da interface.
- Faça registros em qualquer idioma, com transcrição por voz no idioma que você fala.
- Insights mais organizados: crenças muito parecidas passam a se agrupar como variações.
- Login com Google mais estável e melhorias gerais de desempenho.

### Inglês

In this update:
- You can now choose your native language. Your emotions, beliefs, and patterns show up in the language of your entries, not the app's interface.
- Journal in any language, with voice transcription in the language you speak.
- Cleaner insights: very similar beliefs are now grouped together as variations.
- More reliable Google sign-in and general performance improvements.

---

## 4. Passo a passo — App Store Connect (iOS)

1. Confirmar que o contrato foi aceito (senão nada disso pode ser enviado).
2. Apps → Caminare → criar a versão `3.1.0` (botão de + ao lado de iOS App).
3. Preencher as "Novidades desta versão" em PT e EN (textos da seção 3).
4. (Se for trocar o nome) Informações do App → editar nome/subtítulo em cada idioma.
5. Informações do App → atualizar URLs de suporte e privacidade (seção 2).
6. Selecionar o build 3.1.0 que subiu pelo Codemagic/TestFlight.
7. Classificação etária: responder as novas perguntas sobre redes sociais como "Não"
   (o Caminare não tem interação entre usuários). Manter a faixa já definida.
8. Conferir screenshots atuais.
9. Enviar para análise.

## 5. Passo a passo — Play Console (Android)

1. (Se for trocar o nome) Presença na loja → Detalhes do app → editar nome em PT e EN.
2. Atualizar a URL de política de privacidade (seção 2).
3. Produção → Criar nova versão → subir o AAB do Codemagic.
4. Preencher as notas da versão em PT e EN (textos da seção 3).
5. Revisar e lançar.

Lembrete: a verificação de desenvolvedor (prazo 30/09) é da conta da Calíope, então
a parte de identidade é do Ricardo. Não bloqueia esta versão agora.

---

## 6. Fica pro próximo build (não é desta versão)

- Firebase (analytics do app) + reativar o ATT + declarações de privacidade das lojas.
