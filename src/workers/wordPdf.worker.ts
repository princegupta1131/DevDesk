import type { WorkerMessage, WorkerResponse } from '../types/worker';
import * as mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface WordPdfRequest {
    data: ArrayBuffer;
    type: 'word-to-pdf' | 'pdf-to-word';
}

export interface WordPdfResponse {
    data: ArrayBuffer;
    fileName: string;
}

self.onmessage = async (e: MessageEvent<WorkerMessage<WordPdfRequest>>) => {
    const { type, payload, id } = e.data;

    try {
        if (type === 'CONVERT_WORD_PDF') {
            const { data, type: convType } = payload;

            if (convType === 'word-to-pdf') {
                // docx -> pdf
                const result = await mammoth.extractRawText({ arrayBuffer: data });
                const text = result.value;

                const pdfDoc = await PDFDocument.create();
                const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
                let page = pdfDoc.addPage();
                const { height } = page.getSize();
                const fontSize = 12;
                const margin = 50;
                const lineHeight = fontSize + 5;

                // Simple text-to-pdf logic (we'll wrap lines manually)
                const lines = text.split('\n');
                let y = height - margin;

                for (const line of lines) {
                    if (y < margin) {
                        page = pdfDoc.addPage();
                        y = height - margin;
                    }

                    // Simple line wrapping (rough estimate)
                    const maxLength = 80;
                    if (line.length > maxLength) {
                        const chunks = line.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [line];
                        for (const chunk of chunks) {
                            if (y < margin) {
                                page = pdfDoc.addPage();
                                y = height - margin;
                            }
                            page.drawText(chunk.trim(), {
                                x: margin,
                                y,
                                size: fontSize,
                                font: timesRomanFont,
                                color: rgb(0, 0, 0),
                            });
                            y -= lineHeight;
                        }
                    } else {
                        page.drawText(line, {
                            x: margin,
                            y,
                            size: fontSize,
                            font: timesRomanFont,
                            color: rgb(0, 0, 0),
                        });
                        y -= lineHeight;
                    }
                }

                const pdfBytes = await pdfDoc.save();

                const response: WorkerResponse<WordPdfResponse> = {
                    type: 'CONVERSION_SUCCESS',
                    payload: { data: pdfBytes.buffer as ArrayBuffer, fileName: 'converted.pdf' },
                    id,
                };
                (self as any).postMessage(response, [pdfBytes.buffer]);
            } else if (convType === 'pdf-to-word') {
                throw new Error('PDF to Word conversion is currently limited to text extraction. Please use a backend service for high-fidelity conversion.');
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const response: WorkerResponse = {
            type: 'CONVERSION_ERROR',
            payload: null,
            id,
            error: errorMessage,
        };
        self.postMessage(response);
    }
};

export { };
