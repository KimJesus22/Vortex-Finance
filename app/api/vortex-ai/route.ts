import { NextResponse } from 'next/server';

const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'El mensaje es requerido' }, { status: 400 });
    }

    let systemPrompt = '';

    if (mode === 'categorize') {
      systemPrompt = `Eres un asistente de extracción de datos financieros. Tu única tarea es analizar el mensaje del usuario y devolver un ARREGLO JSON válido y estricto (una lista de objetos). NO agregues texto adicional, saludos ni explicaciones. Solo el JSON.
Formato requerido:
[
  {
    "amount": número (extrae la cantidad mencionada, si no hay asume 0),
    "type": "ingreso" o "gasto",
    "category": string (infiere una categoría corta, ej. "Nómina", "Comida", "Transporte")
  }
]
Asegúrate de extraer TODAS las transacciones mencionadas en el texto y colocarlas como objetos separados en el arreglo.`;
    } else if (mode === 'chat') {
      systemPrompt = `Eres Vortex AI, un asesor financiero amigable e inteligente de la plataforma Vortex Finance. Tu objetivo es dar consejos financieros, ayudar a los usuarios a entender sus finanzas y responder sus dudas de forma clara, concisa y motivadora. Instrucción estricta: Considera que el usuario tiene un viaje próximo a CDMX el 7 de mayo para un concierto con 2 amigas. Si el usuario hace preguntas sobre compras, ahorros o viáticos, recuérdale sutilmente su meta de ahorro y ofrécele consejos para optimizar gastos grupales en la ciudad.`;
    } else {
      return NextResponse.json({ error: 'Modo no soportado. Usa "categorize" o "chat".' }, { status: 400 });
    }

    const response = await fetch(LM_STUDIO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'local-model', // LM Studio ignora este valor generalmente, pero es buena práctica enviarlo
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: mode === 'categorize' ? 0.1 : 0.7, // Menor temperatura para JSON, mayor para chat creativo
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`LM Studio API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    let reply = data.choices[0].message.content;

    // Procesamiento estricto si estamos en modo categorize
    if (mode === 'categorize') {
      // Limpiar posibles bloques de código markdown que la IA a veces añade (ej. ```json ... ```)
      reply = reply.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      try {
        const jsonReply = JSON.parse(reply);
        return NextResponse.json(jsonReply);
      } catch (e) {
        return NextResponse.json(
          { error: 'La IA no devolvió un JSON válido', raw_reply: reply }, 
          { status: 500 }
        );
      }
    }

    // Modo chat devuelve simplemente el texto
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Error en Vortex AI Route:', error);
    
    // Capturar si LM Studio está apagado o inalcanzable
    if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'No se pudo conectar con la IA local. Verifica que LM Studio esté abierto y el servidor local ejecutándose en el puerto 1234.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la petición de IA.' },
      { status: 500 }
    );
  }
}
