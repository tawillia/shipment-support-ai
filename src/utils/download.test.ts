import { expect, it, vi } from 'vitest';
import { trackingReport, conversationReport, downloadText } from './download';
import { mockShipments } from '../data/shipments';
it('exports shipment facts with an explicit missing estimate and demo disclosure',()=>{
 const text=trackingReport(mockShipments.DEMO234567);
 expect(text).toContain('Status: Delayed');expect(text).toContain('Estimated delivery: Not available');expect(text).toContain('fictional demo data');
});
it('exports structured cards and unexecuted proposals in the transcript',()=>{
 const text=conversationReport([{id:'1',role:'assistant',text:'Please review',shipment:mockShipments.DEMO123456,confirmation:{kind:'address',trackingNumber:'DEMO123456',value:'25 Example Street, Northbridge'}}]);
 expect(text).toContain('DEMO123456');expect(text).toContain('Awaiting explicit confirmation');expect(text).toContain('25 Example Street');
});
it('starts a named text download and cleans up the object URL',()=>{
 vi.useFakeTimers();
 const create=vi.fn(()=> 'blob:download-test'),revoke=vi.fn();
 const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL;
 URL.createObjectURL=create;URL.revokeObjectURL=revoke;
 const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(function(this: HTMLAnchorElement){expect(this.download).toBe('tracking.txt');expect(this.href).toContain('blob:download-test');});
 try {downloadText('tracking.txt','Shipment details');expect(click).toHaveBeenCalledOnce();expect(create.mock.calls[0]?.length).toBe(1);vi.runAllTimers();expect(revoke).toHaveBeenCalledWith('blob:download-test');}
 finally {click.mockRestore();URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;vi.useRealTimers();}
});
