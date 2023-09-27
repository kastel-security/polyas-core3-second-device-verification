import jsPDF from 'jspdf'

export function generateReceipt (info: string[]): jsPDF {
  const fullText = [`Project ID: ${info[0]}`, `Voter Id: ${info[1]}`, `Ballot Fingerprint: ${info[2]}`,
  `-----BEGIN FINGERPRINT-----${info[3]}`, '-----END FINGERPRINT-----', '-----BEGIN SIGNATURE-----', `${info[4]}`,
  '-----END SIGNATURE-----']
  const doc = new jsPDF('p', 'px', 'a4') // eslint-disable-line 
  const pageWidth = doc.internal.pageSize.getWidth()
  const left = 60
  doc.setFontSize(16)
  doc.text(fullText, 60, 120, { maxWidth: pageWidth - 2 * left })
  return doc
}
