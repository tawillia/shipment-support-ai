import type { Message, Shipment } from '../engine/types';
const disclosure = 'Shipment Support AI — fictional demo data. No real delivery changes or support transfers.';
export function trackingReport(shipment: Shipment): string {
 return [
  `Tracking details: ${shipment.trackingNumber}`, disclosure, '',
  `Status: ${shipment.status}`, `Route: ${shipment.route}`,
  `Latest update: ${shipment.latestUpdate}`,
  `Estimated delivery: ${shipment.estimatedDelivery || (shipment.status === 'Delivered' ? 'Delivery complete' : 'Not available')}`,
  `Delivery address: ${shipment.address}`,
  ...(shipment.delayReason ? [`Delay reason: ${shipment.delayReason}`] : []),
 ].join('\n');
}
export function conversationReport(messages: Message[]): string {
 return ['Shipment Support AI — conversation transcript', disclosure, '', ...messages.map(message => [
  `${message.role === 'user' ? 'You' : 'Shipment Support AI'}: ${message.text}`,
  ...(message.shipment ? [trackingReport(message.shipment)] : []),
  ...(message.confirmation ? [`Proposed ${message.confirmation.kind} change for ${message.confirmation.trackingNumber}: ${message.confirmation.value}. Awaiting explicit confirmation at this point in the conversation.`] : []),
  ...(message.summary ? [message.summary] : []),
 ].join('\n'))].join('\n\n');
}
export function downloadText(filename: string, content: string): void {
 const url = URL.createObjectURL(new Blob([content], {type:'text/plain;charset=utf-8'}));
 const anchor = document.createElement('a');
 anchor.href = url; anchor.download = filename;
 document.body.append(anchor); anchor.click(); anchor.remove();
 // Keep the object URL alive until the browser has started the download.
 setTimeout(() => URL.revokeObjectURL(url), 1000);
}
