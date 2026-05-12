export type Entry = {
  id: number;
  date: string;
  time: string;
  emotions: string[];
  thoughts: string[];
  summary: string;
  fullText: string;
  color: string;
};

export const entries: Entry[] = [
  {
    id: 1,
    date: '08 Mai, 2026',
    time: '14:30',
    emotions: ['Ansiedade', 'Preocupação'],
    thoughts: ['Não sou competente o suficiente', 'Vou falhar na apresentação'],
    summary: 'Apresentação importante gerando ansiedade...',
    fullText:
      'Hoje fiquei muito ansiosa pensando na apresentação de amanhã. Tenho passado a manhã inteira repassando os slides e cada vez que penso em falar na frente do time, sinto um aperto no peito. O pensamento de "nunca sou boa o suficiente" volta sempre, mesmo quando recebo feedbacks positivos. Tentei respirar fundo e me lembrar que preparei bem o material, mas a sensação de incompetência insiste em aparecer.',
    color: '#534AB7',
  },
  {
    id: 2,
    date: '07 Mai, 2026',
    time: '18:30',
    emotions: ['Gratidão', 'Alegria'],
    thoughts: ['Sou capaz quando confio no time', 'Meu trabalho tem valor'],
    summary: 'Feedback positivo da equipe sobre o projeto...',
    fullText:
      'Recebi um feedback muito positivo da equipe sobre o projeto que entreguei na semana passada. A líder mencionou especificamente como a minha proposta de reestruturação ajudou a destravar uma dor antiga do time. Saí da reunião com uma sensação rara de orgulho e gratidão, e percebi que costumo minimizar conquistas assim. Quero registrar esse momento para lembrar dele quando a autocrítica voltar a aparecer com força.',
    color: '#1D9E75',
  },
  {
    id: 3,
    date: '07 Mai, 2026',
    time: '14:20',
    emotions: ['Frustração'],
    thoughts: ['Ninguém me escuta', 'Não sei me expressar'],
    summary: 'Dificuldade em me comunicar na reunião...',
    fullText:
      'Na reunião de hoje tentei propor uma mudança no fluxo de aprovações, mas senti que ninguém realmente prestou atenção. Quando finalmente alguém retomou a ideia, foi como se tivessem ouvido pela primeira vez, dito por outra pessoa. Fiquei frustrada, mas também me peguei pensando que talvez eu não tenha sido clara. Esse padrão de me culpar primeiro pela falta de escuta dos outros é algo que quero trabalhar.',
    color: '#F59E0B',
  },
  {
    id: 4,
    date: '06 Mai, 2026',
    time: '20:15',
    emotions: ['Cansaço', 'Estresse'],
    thoughts: ['Preciso dar conta de tudo', 'Não posso decepcionar ninguém'],
    summary: 'Dia intenso de trabalho, muitas demandas...',
    fullText:
      'Foi um dia muito intenso. Reuniões emendadas, demandas urgentes chegando de vários lados, e ainda tive que cobrir uma colega que faltou. Chego em casa exausta, com a sensação de que mesmo correndo o dia inteiro nunca é o suficiente. Sei que parte desse cansaço vem da crença de que preciso dar conta de tudo sozinha, mesmo quando o volume é claramente desproporcional.',
    color: '#534AB7',
  },
  {
    id: 5,
    date: '05 Mai, 2026',
    time: '16:45',
    emotions: ['Confiança'],
    thoughts: ['Quando estou tranquila, penso melhor', 'Sou capaz de resolver problemas difíceis'],
    summary: 'Consegui resolver um problema complexo...',
    fullText:
      'Consegui resolver um problema complexo que vinha travando o time há duas semanas. O que mais me chamou atenção não foi a solução em si, mas a calma com que cheguei nela. Em vez de entrar em pânico, parei, escrevi os passos e fui testando hipóteses. Foi uma boa lembrança de que, quando consigo regular a ansiedade, minha capacidade técnica aparece com clareza.',
    color: '#1D9E75',
  },
];

export function getEntryById(id: number): Entry | undefined {
  return entries.find((entry) => entry.id === id);
}
