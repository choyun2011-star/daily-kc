import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support base64 image payloads up to 25MB
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Shared Gemini AI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Food photo recognition endpoint
app.post('/api/ai/recognize-food', async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, mimeType = 'image/jpeg', foodHint } = req.body;

    if (!image) {
      res.status(400).json({
        error: 'Зургийн өгөгдөл илгээгдээгүй байна (Зураг шаардлагатай).',
      });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'AI үйлчилгээ одоогоор тохируулагдаагүй байна. Та хоолны мэдээллээ гараар оруулж тэмдэглэлдээ хадгална уу.',
        manualFallbackAvailable: true,
      });
      return;
    }

    // Clean base64 string if data URL prefix is included
    const cleanBase64 = image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const promptText = `Та монгол хоол, шим тэжээлийн шинжээч хиймэл оюун ухаан юм.
Энэхүү хоолны гэрэл зургийг шинжлэн дараах дүрмийг баримтлан үр дүнг БҮРЭН МОНГОЛ ХЭЛЭЭР буцаана уу:
1. Монгол үндэсний хоол (цуйван, бууз, хуушуур, банштай шөл, гурилтай шөл, нийслэл салат, чанасан мах, хуурга, мантуу г.м.) болон өдөр тутмын хоол хүнсийг нарийн танина.
2. Хэрэглэгчийн өгсөн нэмэлт тайлбар (хэрэв байгаа бол): "${foodHint || 'Байхгүй'}". Хэрэв хэрэглэгч нэр өгсөн бол түүнийг харгалзан тооцоолно уу.
3. Тооцоолсон порцын хэмжээ (грамм), илчлэг (ккал), уураг (г), нүүрс ус (г), өөх тос (г)-ийг тооцоол.
4. "uncertaintyNotice" талбарт: Зөвхөн гэрэл зургаар бодит жин, орц, тос болон хийсэн аргыг 100% нарийн тогтоох боломжгүй тул энэ нь баримжаа тооцоо болохыг монгол хэлээр эелдэг, тодорхой анхааруулж бичнэ үү.
5. "alternativeSuggestions" хэсэгт байж болох өөр 2-3 боломжит хоолны нэрийг жагсаана уу.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        systemInstruction:
          'Та эрүүл мэнд, шим тэжээлийн мэргэжлийн зөвлөх. Бүх хариултыг кирилл монгол хэлээр, зөв дүрмээр, найдвартай баримжаатайгаар JSON форматаар өгнө үү.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: {
              type: Type.STRING,
              description: 'Хоолны монгол нэр, жишээ нь: Шарсан махтай ногоотой цуйван',
            },
            confidence: {
              type: Type.STRING,
              description: 'Итгэлцүүрийн түвшин: high, medium, эсвэл low',
            },
            estimatedGrams: {
              type: Type.NUMBER,
              description: 'Зургаас тооцоолсон баримжаа порцын жин (грамм)',
            },
            servingDescription: {
              type: Type.STRING,
              description: 'Порцын тайлбар, жишээ нь: Дундаж хэмжээтэй 1 таваг (~350г)',
            },
            calories: {
              type: Type.NUMBER,
              description: 'Нийт тооцоолсон илчлэг (ккал)',
            },
            protein: {
              type: Type.NUMBER,
              description: 'Уураг (грамм)',
            },
            carbs: {
              type: Type.NUMBER,
              description: 'Нүүрс ус (грамм)',
            },
            fat: {
              type: Type.NUMBER,
              description: 'Өөх тос (грамм)',
            },
            uncertaintyNotice: {
              type: Type.STRING,
              description: 'Зургийн нарийвчлалын тухай монгол хэл дээрх анхааруулга',
            },
            alternativeSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Өөр байж болох хувилбарууд',
            },
          },
          required: [
            'foodName',
            'confidence',
            'estimatedGrams',
            'servingDescription',
            'calories',
            'protein',
            'carbs',
            'fat',
            'uncertaintyNotice',
          ],
        },
      },
    });

    const textOutput = response.text?.trim();
    if (!textOutput) {
      throw new Error('AI хариу хоосон буцаж ирлээ.');
    }

    const parsedResult = JSON.parse(textOutput);
    res.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error('AI food recognition error:', error);
    res.status(500).json({
      error: 'Зургийг шинжлэхэд алдаа гарлаа. Та хоолны нэр, грамм, илчлэгээ гараар оруулан үргэлжлүүлнэ үү.',
      details: error?.message || 'Тодорхойгүй алдаа',
      manualFallbackAvailable: true,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Daily Kcal server running at http://localhost:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
