/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { SaleInvoice } from '../entities/saleInvoice.entity';

export interface LedgerRow {
  date: Date | string;
  voucherNumber: string;
  description?: string;
  debit: number;
  credit: number;
}

type PDFDoc = InstanceType<typeof PDFDocument>;

@Injectable()
export class PdfService {
  generateSaleInvoicePdf(invoice: SaleInvoice, brand: string): PDFDoc {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      autoFirstPage: true,
    });

    const W = 595.28; // A4 width in points
    const M = 50; // page margin
    const CW = W - 2 * M; // content width = 495.28

    const BLUE = '#1a3a6b';
    const DARK = '#333333';
    const GRAY = '#666666';
    const BGALT = '#f5f5f5';
    const BGSUM = '#e8edf5';
    const BORDER = '#cccccc';

    // ── Company Header ───────────────────────────────────────────────────────
    const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor(BLUE)
      .text(brandName, M, M, { lineBreak: false });

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(BLUE)
      .text('SALE INVOICE', M, M, {
        align: 'right',
        width: CW,
        lineBreak: false,
      });

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(GRAY)
      .text('Industrial Chemicals & Equipment', M, M + 26, {
        lineBreak: false,
      });

    // Horizontal rule
    doc
      .moveTo(M, 100)
      .lineTo(W - M, 100)
      .strokeColor(BLUE)
      .lineWidth(2)
      .stroke();

    let y = 112;

    // ── Meta + Customer (two columns) ────────────────────────────────────────
    const RCX = M + CW / 2 + 10; // right column x
    const RCW = CW / 2 - 10; // right column width
    const LCW = CW / 2 - 10; // left column width

    // Left: Invoice metadata
    const meta: [string, string][] = [
      ['Invoice No.', invoice.invoiceNumber ?? ''],
      ['Invoice Date', fmtDate(invoice.invoiceDate)],
    ];
    if (invoice.poNumber) meta.push(['PO No.', invoice.poNumber]);
    if (invoice.deliveryNumber)
      meta.push(['Delivery No.', invoice.deliveryNumber]);

    for (const [label, value] of meta) {
      doc
        .fontSize(9)
        .fillColor(GRAY)
        .text(label + ':', M, y, { width: 88, lineBreak: false });
      doc
        .fontSize(9)
        .fillColor(DARK)
        .text(value, M + 90, y, { width: LCW - 90, lineBreak: false });
      y += 16;
    }

    // Right: Customer
    let ry = 112;
    doc
      .fontSize(9)
      .fillColor(GRAY)
      .text('Bill To:', RCX, ry, { width: RCW, lineBreak: false });
    ry += 13;
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(DARK)
      .text(invoice.accountTitle, RCX, ry, { width: RCW });
    ry += doc.heightOfString(invoice.accountTitle, { width: RCW }) + 4;
    doc.font('Helvetica');

    if (invoice.ntnNumber) {
      doc
        .fontSize(9)
        .fillColor(GRAY)
        .text(`NTN: ${invoice.ntnNumber}`, RCX, ry, {
          width: RCW,
          lineBreak: false,
        });
      ry += 14;
    }
    if ((invoice as any).strnNumber) {
      doc
        .fontSize(9)
        .fillColor(GRAY)
        .text(`STRN: ${(invoice as any).strnNumber}`, RCX, ry, {
          width: RCW,
          lineBreak: false,
        });
      ry += 14;
    }
    if (invoice.province) {
      doc
        .fontSize(9)
        .fillColor(GRAY)
        .text(`Province: ${invoice.province}`, RCX, ry, {
          width: RCW,
          lineBreak: false,
        });
      ry += 14;
    }

    y = Math.max(y, ry) + 14;

    // Thin divider
    doc
      .moveTo(M, y)
      .lineTo(W - M, y)
      .strokeColor(BORDER)
      .lineWidth(0.5)
      .stroke();
    y += 10;

    // ── Product Table ────────────────────────────────────────────────────────
    // Column: x offset from M, width
    const COL = {
      num: { x: M, w: 22 },
      product: { x: M + 22, w: 145 },
      hs: { x: M + 167, w: 56 },
      qty: { x: M + 223, w: 38 },
      rate: { x: M + 261, w: 62 },
      exgst: { x: M + 323, w: 68 },
      gstpct: { x: M + 391, w: 38 },
      net: { x: M + 429, w: 66 },
    };
    const RH = 18; // row height

    // Header row
    doc.rect(M, y, CW, RH).fillColor(BLUE).fill();
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('white');
    const hy = y + 5;
    doc.text('#', COL.num.x, hy, {
      width: COL.num.w,
      align: 'center',
      lineBreak: false,
    });
    doc.text('Product', COL.product.x, hy, {
      width: COL.product.w,
      align: 'left',
      lineBreak: false,
    });
    doc.text('HS Code', COL.hs.x, hy, {
      width: COL.hs.w,
      align: 'left',
      lineBreak: false,
    });
    doc.text('Qty', COL.qty.x, hy, {
      width: COL.qty.w,
      align: 'right',
      lineBreak: false,
    });
    doc.text('Rate', COL.rate.x, hy, {
      width: COL.rate.w,
      align: 'right',
      lineBreak: false,
    });
    doc.text('Ex-GST Amt', COL.exgst.x, hy, {
      width: COL.exgst.w,
      align: 'right',
      lineBreak: false,
    });
    doc.text('GST%', COL.gstpct.x, hy, {
      width: COL.gstpct.w,
      align: 'right',
      lineBreak: false,
    });
    doc.text('Net Amount', COL.net.x, hy, {
      width: COL.net.w,
      align: 'right',
      lineBreak: false,
    });
    doc.font('Helvetica');

    y += RH;

    let totalNet = 0,
      totalExGst = 0,
      totalGst = 0;

    for (let i = 0; i < invoice.products.length; i++) {
      const p = invoice.products[i];
      const bg = i % 2 === 0 ? 'white' : BGALT;
      doc.rect(M, y, CW, RH).fillColor(bg).fill();
      doc.rect(M, y, CW, RH).strokeColor(BORDER).lineWidth(0.3).stroke();

      doc.font('Helvetica').fontSize(8).fillColor(DARK);
      const ty = y + 5;
      doc.text(String(i + 1), COL.num.x, ty, {
        width: COL.num.w,
        align: 'center',
        lineBreak: false,
      });
      doc.text(p.productName ?? '', COL.product.x, ty, {
        width: COL.product.w,
        align: 'left',
        lineBreak: false,
      });
      doc.text(p.hsCode ?? '', COL.hs.x, ty, {
        width: COL.hs.w,
        align: 'left',
        lineBreak: false,
      });
      doc.text(String(p.quantity), COL.qty.x, ty, {
        width: COL.qty.w,
        align: 'right',
        lineBreak: false,
      });
      doc.text(fmtNum(p.rate), COL.rate.x, ty, {
        width: COL.rate.w,
        align: 'right',
        lineBreak: false,
      });
      doc.text(fmtNum(p.exGstAmount), COL.exgst.x, ty, {
        width: COL.exgst.w,
        align: 'right',
        lineBreak: false,
      });
      doc.text(`${p.gstPercent ?? 0}%`, COL.gstpct.x, ty, {
        width: COL.gstpct.w,
        align: 'right',
        lineBreak: false,
      });
      doc.text(fmtNum(p.netAmount), COL.net.x, ty, {
        width: COL.net.w,
        align: 'right',
        lineBreak: false,
      });

      totalExGst += Number(p.exGstAmount) || 0;
      totalGst += Number(p.netAmount) - Number(p.exGstAmount) || 0;
      totalNet += Number(p.netAmount) || 0;

      y += RH;
    }

    // Totals row
    doc.rect(M, y, CW, RH).fillColor(BGSUM).fill();
    doc.rect(M, y, CW, RH).strokeColor(BORDER).lineWidth(0.3).stroke();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK);
    const toty = y + 5;
    doc.text('TOTALS', COL.product.x, toty, {
      width: COL.product.w,
      align: 'left',
      lineBreak: false,
    });
    doc.text(fmtNum(totalExGst), COL.exgst.x, toty, {
      width: COL.exgst.w,
      align: 'right',
      lineBreak: false,
    });
    doc.text(fmtNum(totalNet), COL.net.x, toty, {
      width: COL.net.w,
      align: 'right',
      lineBreak: false,
    });
    doc.font('Helvetica');
    y += RH + 14;

    // ── Totals Summary Box ───────────────────────────────────────────────────
    const SX = M + CW - 190;
    const SW = 190;
    const SL = 100; // label portion width
    const SV = SW - SL - 10; // value portion width

    const summaryRows = [
      { label: 'Sub-Total (Ex-GST)', value: fmtNum(totalExGst), bold: false },
      { label: 'GST Amount', value: fmtNum(totalGst), bold: false },
      { label: 'Grand Total', value: fmtNum(totalNet), bold: true },
    ];

    for (const row of summaryRows) {
      const rh = row.bold ? 20 : 17;
      if (row.bold) {
        doc.rect(SX, y, SW, rh).fillColor(BGSUM).fill();
        doc.rect(SX, y, SW, rh).strokeColor(BLUE).lineWidth(0.6).stroke();
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BLUE);
      } else {
        doc.font('Helvetica').fontSize(9).fillColor(DARK);
      }
      doc.text(row.label, SX + 5, y + (rh - 9) / 2, {
        width: SL,
        align: 'left',
        lineBreak: false,
      });
      doc.text(row.value, SX + SL + 5, y + (rh - 9) / 2, {
        width: SV - 5,
        align: 'right',
        lineBreak: false,
      });
      doc.font('Helvetica');
      y += rh + 3;
    }

    y += 20;

    // ── Notes ────────────────────────────────────────────────────────────────
    if (invoice.notes) {
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(GRAY)
        .text('Notes:', M, y);
      doc.font('Helvetica');
      y += 13;
      doc.fontSize(9).fillColor(DARK).text(invoice.notes, M, y, { width: CW });
    }

    // ── Page Footer ──────────────────────────────────────────────────────────
    const FY = doc.page.height - 65;
    doc
      .moveTo(M, FY)
      .lineTo(W - M, FY)
      .strokeColor(BORDER)
      .lineWidth(0.5)
      .stroke();
    doc.font('Helvetica').fontSize(8).fillColor(GRAY);
    doc.text(
      'Authorized Signature: _______________________________',
      M,
      FY + 10,
      { lineBreak: false },
    );
    doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, M, FY + 10, {
      align: 'right',
      width: CW,
      lineBreak: false,
    });

    return doc;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // General Ledger PDF
  // ─────────────────────────────────────────────────────────────────────────
  generateLedgerPdf(
    transactions: LedgerRow[],
    accountInfo: { accountNumber: string; accountName: string },
    dateRange: { startDate?: string; endDate?: string },
  ): PDFDoc {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      autoFirstPage: true,
    });

    const W = 595.28;
    const M = 40;
    const CW = W - 2 * M; // 515.28

    const RED = '#990000';
    const NAVY = '#000080';
    const BLACK = '#222222';
    const ALT_BG = '#f5f5f5';
    const GRID = '#cccccc';

    // Column layout (widths sum to CW = 515.28)
    const dateCol = { x: M, w: 60 };
    const vchCol = { x: M + 60, w: 72 };
    const narCol = { x: M + 132, w: 175 };
    const drCol = { x: M + 307, w: 68 };
    const crCol = { x: M + 375, w: 68 };
    const balCol = { x: M + 443, w: CW - 443 }; // 72.28

    const fmt = (n: number) =>
      (n || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const PAGE_BOTTOM = 800;

    const drawDocHeader = (y: number): number => {
      // Company name – Red, bold
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(RED)
        .text('CHEMTRONIX ENGINEERING SOLUTION', M, y);
      y += 20;
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(BLACK)
        .text('552 Mujtaba Canal View, Main Qasimpur Canal Road, Multan', M, y);
      y += 12;
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(BLACK)
        .text('Industrial Chemicals & Equipment Suppliers', M, y);
      y += 18;

      // Separator rule
      doc
        .moveTo(M, y)
        .lineTo(W - M, y)
        .strokeColor(NAVY)
        .lineWidth(1.5)
        .stroke();
      y += 8;

      // Title – Navy Blue, centered
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(NAVY)
        .text('Account Ledger Report', M, y, { align: 'center', width: CW });
      const titleWidth = doc.widthOfString('Account Ledger Report');
      const titleX = M + (CW - titleWidth) / 2;
      y += 17;
      // Underline the title
      doc
        .moveTo(titleX, y - 1)
        .lineTo(titleX + titleWidth, y - 1)
        .strokeColor(NAVY)
        .lineWidth(0.75)
        .stroke();
      doc
        .moveTo(M, y + 3)
        .lineTo(W - M, y + 3)
        .strokeColor(NAVY)
        .lineWidth(1.5)
        .stroke();
      y += 15;

      // Metadata
      doc.font('Helvetica').fontSize(9).fillColor(BLACK);
      doc.text('Opening Balance Included: Yes', M, y);
      y += 13;
      doc.text(
        `Account: ${accountInfo.accountNumber} \u2014 ${accountInfo.accountName}`,
        M,
        y,
      );
      y += 13;
      const formatDate = (iso?: string) => {
        if (!iso) return 'All';
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      };
      const from = formatDate(dateRange.startDate);
      const to = formatDate(dateRange.endDate);
      doc.text(`Date Range:   From: ${from}   To: ${to}`, M, y);
      y += 20;
      return y;
    };

    const drawTableHeader = (y: number): number => {
      const rh = 16;
      doc.rect(M, y, CW, rh).fill(NAVY);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
      doc.text('Date', dateCol.x + 2, y + 4, { width: dateCol.w - 4 });
      doc.text('VchNo', vchCol.x + 2, y + 4, { width: vchCol.w - 4 });
      doc.text('Narration', narCol.x + 2, y + 4, { width: narCol.w - 4 });
      doc.text('Debit', drCol.x + 2, y + 4, {
        width: drCol.w - 4,
        align: 'right',
      });
      doc.text('Credit', crCol.x + 2, y + 4, {
        width: crCol.w - 4,
        align: 'right',
      });
      doc.text('Balance', balCol.x + 2, y + 4, {
        width: balCol.w - 4,
        align: 'right',
      });
      return y + rh;
    };

    let y = M;
    y = drawDocHeader(y);
    y = drawTableHeader(y);

    let rowIdx = 0;
    let runBal = 0;
    let totDr = 0;
    let totCr = 0;

    for (const tx of transactions) {
      const dr = Number(tx.debit) || 0;
      const cr = Number(tx.credit) || 0;
      runBal += dr - cr;
      totDr += dr;
      totCr += cr;

      const narration = tx.description || '';
      doc.font('Helvetica').fontSize(8);
      const narH = doc.heightOfString(narration, { width: narCol.w - 4 });
      const rh = Math.max(16, narH + 8);

      if (y + rh > PAGE_BOTTOM) {
        doc.addPage();
        y = M;
        y = drawDocHeader(y);
        y = drawTableHeader(y);
        rowIdx = 0;
      }

      // Alternating row background
      if (rowIdx % 2 === 0) {
        doc.rect(M, y, CW, rh).fill(ALT_BG);
      }
      doc.rect(M, y, CW, rh).strokeColor(GRID).lineWidth(0.3).stroke();

      const balLabel = `${fmt(Math.abs(runBal))} ${runBal >= 0 ? 'Dr' : 'Cr'}`;
      const dateStr = tx.date
        ? new Date(tx.date).toLocaleDateString('en-GB')
        : '';

      doc.font('Helvetica').fontSize(8).fillColor(BLACK);
      doc.text(dateStr, dateCol.x + 2, y + 4, { width: dateCol.w - 4 });
      doc.text(tx.voucherNumber || '', vchCol.x + 2, y + 4, {
        width: vchCol.w - 4,
      });
      doc.text(narration, narCol.x + 2, y + 4, { width: narCol.w - 4 });
      if (dr > 0)
        doc.text(fmt(dr), drCol.x + 2, y + 4, {
          width: drCol.w - 4,
          align: 'right',
        });
      if (cr > 0)
        doc.text(fmt(cr), crCol.x + 2, y + 4, {
          width: crCol.w - 4,
          align: 'right',
        });
      doc.text(balLabel, balCol.x + 2, y + 4, {
        width: balCol.w - 4,
        align: 'right',
      });

      y += rh;
      rowIdx++;
    }

    // Grand Total row
    if (y + 20 > PAGE_BOTTOM) {
      doc.addPage();
      y = M;
    }
    const grandBal = `${fmt(Math.abs(runBal))} ${runBal >= 0 ? 'Dr' : 'Cr'}`;
    doc.rect(M, y, CW, 20).fill(NAVY);
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
    // Label spans date + vch + narration columns
    doc.text('Grand Total', M + 2, y + 6, { width: 303 });
    doc.text(fmt(totDr), drCol.x + 2, y + 6, {
      width: drCol.w - 4,
      align: 'right',
    });
    doc.text(fmt(totCr), crCol.x + 2, y + 6, {
      width: crCol.w - 4,
      align: 'right',
    });
    doc.text(grandBal, balCol.x + 2, y + 6, {
      width: balCol.w - 4,
      align: 'right',
    });

    doc.end();
    return doc;
  }
}

function fmtNum(n: number | undefined | null): string {
  return Number(n ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(d: Date | string | undefined): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
