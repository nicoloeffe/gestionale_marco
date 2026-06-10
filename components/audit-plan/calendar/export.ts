import { auditorsOf, clientOf, standardsOf, type CalendarEvent } from './data'

function safeFilePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'export'
}

export async function exportEventsToXlsx(events: CalendarEvent[], filenamePrefix = 'eventi-audit') {
  const ExcelJS = await import('exceljs')
  const rows = events.map((event) => {
    const client = clientOf(event)
    const auditors = auditorsOf(event).map((auditor) => auditor.name).join(', ')
    const standards = standardsOf(event).map((standard) => standard.code).join(', ')

    return [
      new Date(event.start),
      new Date(event.end),
      client?.name ?? '',
      client?.entity ?? '',
      auditors,
      standards,
      event.auditNumber,
      event.auditType,
      event.status,
      event.performed ? 'Si' : 'No',
      event.notes,
    ]
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'AuditPlan'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet('Eventi audit')
  worksheet.columns = [
    { header: 'Data inizio', key: 'start', width: 20 },
    { header: 'Data fine', key: 'end', width: 20 },
    { header: 'Azienda', key: 'client', width: 28 },
    { header: 'Ente', key: 'ente', width: 18 },
    { header: 'Auditor', key: 'auditors', width: 24 },
    { header: 'Norme', key: 'standards', width: 24 },
    { header: 'Numero audit', key: 'auditNumber', width: 18 },
    { header: 'Tipo', key: 'auditType', width: 18 },
    { header: 'Stato', key: 'status', width: 18 },
    { header: 'Effettuato', key: 'performed', width: 12 },
    { header: 'Note', key: 'notes', width: 36 },
  ]
  worksheet.addRows(rows)
  worksheet.getRow(1).font = { bold: true }
  worksheet.getColumn(1).numFmt = 'dd/mm/yyyy hh:mm'
  worksheet.getColumn(2).numFmt = 'dd/mm/yyyy hh:mm'

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeFilePart(filenamePrefix)}-${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
