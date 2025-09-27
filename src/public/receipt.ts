import jsPDF from 'jspdf'

export function generateReceipt (info: string[]): jsPDF {
  const fullText = [`Project Id: ${info[0]}`, `Voter Id: ${info[1]}`, `Ballot Fingerprint: ${info[2]}`,
  `-----BEGIN FINGERPRINT-----${info[3]}`, '-----END FINGERPRINT-----', '-----BEGIN SIGNATURE-----', `${info[4]}`,
  '-----END SIGNATURE-----']
  const doc = new jsPDF('p', 'px', 'a4') // eslint-disable-line
  doc.setProperties({
    title: 'Wahl-Quittung der Stimmabgabe',
    subject: 'Sofern für Ihre Online-Wahl eine externe Wahl-Verifizierung durchgeführt wird, können Sie diese Quittung den externen Prüfenden zur universellen Wahl-Verifizierung vorzeigen.',
    creator: 'KASTEL Polyas-Verifier'
  })
  const pageWidth = doc.internal.pageSize.getWidth()
  const left = 60
  doc.setDisplayMode('fullpage')
  doc.viewerPreferences({ FitWindow: true })
  doc.setLanguage('de-DE')
  doc.text('Wahl-Quittung der Stimmabgabe', 40, 30)
  doc.setFontSize(16)
  doc.setFont('courier', 'normal')
  doc.text(fullText, 60, 120, { maxWidth: pageWidth - 2 * left })
  return doc
}
