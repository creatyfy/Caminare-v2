import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const colors = {
  primary: '#534AB7',
  primaryDark: '#3D365C',
  tint: '#F0EFFF',
  tintStrong: '#E4E1FA',
  text: '#2D2A45',
  textSoft: '#4A4763',
  muted: '#6B7280',
  border: '#E5E5EB',
  positive: '#1D9E75',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontFamily: 'Helvetica',
    color: colors.text,
    fontSize: 10.5,
    lineHeight: 1.5,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 38,
    height: 38,
    objectFit: 'contain',
  },
  brandText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: colors.primaryDark,
    letterSpacing: 0.4,
  },
  generatedAt: {
    fontSize: 9,
    color: colors.muted,
  },
  // Cover block
  cover: {
    backgroundColor: colors.tint,
    borderRadius: 14,
    padding: 22,
    marginBottom: 22,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: colors.primaryDark,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  coverRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  coverLabel: {
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    width: 64,
  },
  coverValue: {
    fontSize: 11,
    color: colors.text,
    flex: 1,
  },
  // Section title
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 8,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statBlock: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  statNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: colors.primary,
    lineHeight: 1.1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  tag: {
    backgroundColor: colors.tint,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: colors.primary,
  },
  tagCount: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: colors.primary,
  },
  tagSmall: {
    backgroundColor: colors.tint,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tagSmallText: {
    fontSize: 9,
    color: colors.primary,
    fontFamily: 'Helvetica-Bold',
  },
  // Events
  eventCard: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingLeft: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  eventMeta: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold',
  },
  eventText: {
    fontSize: 10.5,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 1.55,
  },
  eventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  // Misc
  empty: {
    fontSize: 11,
    color: colors.muted,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 8.5,
    color: colors.muted,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerBrand: {
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  footerNote: {
    fontStyle: 'italic',
  },
});

export interface TherapyReportEvent {
  date: string;
  time: string;
  text: string;
  emotions: string[];
}

export interface TherapyReportEmotion {
  name: string;
  count: number;
}

export interface TherapyReportData {
  title: string;
  userName: string;
  periodLabel: string;
  generatedLabel: string;
  totalEntries: number;
  totalEntriesLabel: string;
  topEmotionsLabel: string;
  topEmotions: TherapyReportEmotion[];
  eventsHeader: string;
  events: TherapyReportEvent[];
  labels: {
    forLabel: string;
    periodLabelKey: string;
    generatedLabelKey: string;
    pageLabel: string;
    emptyEvents: string;
    confidentialNote: string;
  };
  logoSrc: string;
}

export function TherapyReportPDF({ data }: { data: TherapyReportData }) {
  return (
    <Document
      title={`${data.title} — ${data.userName}`}
      author="Caminare"
      subject={data.title}
      creator="Caminare"
    >
      <Page size="A4" style={styles.page}>
        {/* Header com logo */}
        <View style={styles.header} fixed>
          <View style={styles.brand}>
            <Image src={data.logoSrc} style={styles.logo} />
            <Text style={styles.brandText}>Caminare</Text>
          </View>
          <Text style={styles.generatedAt}>{data.generatedLabel}</Text>
        </View>

        {/* Cover block */}
        <View style={styles.cover}>
          <Text style={styles.title}>{data.title}</Text>
          <View style={styles.coverRow}>
            <Text style={styles.coverLabel}>{data.labels.forLabel}</Text>
            <Text style={styles.coverValue}>{data.userName}</Text>
          </View>
          <View style={styles.coverRow}>
            <Text style={styles.coverLabel}>{data.labels.periodLabelKey}</Text>
            <Text style={styles.coverValue}>{data.periodLabel}</Text>
          </View>
        </View>

        {/* Visão geral */}
        <Text style={styles.sectionTitle}>{data.labels.periodLabelKey === 'Período' ? 'Visão Geral' : 'Overview'}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{data.totalEntries}</Text>
            <Text style={styles.statLabel}>{data.totalEntriesLabel}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{data.topEmotions.length}</Text>
            <Text style={styles.statLabel}>{data.topEmotionsLabel}</Text>
          </View>
        </View>

        {/* Top emoções */}
        {data.topEmotions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{data.topEmotionsLabel}</Text>
            <View style={styles.tagsRow}>
              {data.topEmotions.map((e) => (
                <View key={e.name} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {e.name}
                    <Text style={styles.tagCount}> · {e.count}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Eventos */}
        <Text style={styles.sectionTitle}>{data.eventsHeader}</Text>
        {data.events.length === 0 ? (
          <Text style={styles.empty}>{data.labels.emptyEvents}</Text>
        ) : (
          data.events.map((ev, i) => (
            <View key={i} style={styles.eventCard} wrap={false}>
              <Text style={styles.eventMeta}>
                {ev.date} · {ev.time}
              </Text>
              <Text style={styles.eventText}>{ev.text}</Text>
              {ev.emotions.length > 0 && (
                <View style={styles.eventTags}>
                  {ev.emotions.map((emName) => (
                    <View key={emName} style={styles.tagSmall}>
                      <Text style={styles.tagSmallText}>{emName}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}

        {/* Footer fixo */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>CAMINARE</Text>
          <Text style={styles.footerNote}>{data.labels.confidentialNote}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${data.labels.pageLabel} ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
