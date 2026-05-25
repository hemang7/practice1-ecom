type RecommendationProduct = {
  name: string;
  category: string;
  description: string;
};

type RecommendationRequest = {
  currentProduct: RecommendationProduct;
  allProducts: RecommendationProduct[];
};

type Recommendation = {
  name: string;
  reason: string;
};

type RecommendationResponse = {
  recommendations: Recommendation[];
};

function isValidProduct(value: unknown): value is RecommendationProduct {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const product = value as Record<string, unknown>;
  return (
    typeof product.name === 'string' &&
    typeof product.category === 'string' &&
    typeof product.description === 'string'
  );
}

function parseRequestBody(body: unknown): RecommendationRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const payload = body as Record<string, unknown>;

  if (!isValidProduct(payload.currentProduct) || !Array.isArray(payload.allProducts)) {
    return null;
  }

  const allProducts = payload.allProducts.filter(isValidProduct);

  if (allProducts.length === 0) {
    return null;
  }

  return {
    currentProduct: payload.currentProduct,
    allProducts,
  };
}

function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_API_KEY;
}

export async function POST(request: Request) {
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    return Response.json(
      { message: 'OpenAI API key is not configured. Set OPENAI_API_KEY in .env.local.' },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = parseRequestBody(body);

  if (!parsed) {
    return Response.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const systemPrompt = `You are a smart ecommerce recommendation engine.
Recommend 2-3 complementary products from the provided allProducts list that pair well with the currentProduct.
Only recommend products that exist in allProducts (use their exact name values).
Return JSON with this exact structure: { "recommendations": [ { "name": string, "reason": string } ] }`;

  try {
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: JSON.stringify({
              currentProduct: parsed.currentProduct,
              allProducts: parsed.allProducts,
            }),
          },
        ],
      }),
    });

    if (!openAiResponse.ok) {
      const errorBody = await openAiResponse.text();
      console.error('OpenAI recommendations error:', openAiResponse.status, errorBody);
      return Response.json({ message: 'Failed to generate recommendations.' }, { status: 502 });
    }

    const completion = (await openAiResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json({ message: 'No recommendations returned.' }, { status: 502 });
    }

    const result = JSON.parse(content) as RecommendationResponse;

    if (!Array.isArray(result.recommendations)) {
      return Response.json({ message: 'Invalid recommendations format.' }, { status: 502 });
    }

    const productsByName = new Map(
      parsed.allProducts.map((product) => [product.name.toLowerCase().trim(), product.name]),
    );
    const recommendations = result.recommendations
      .map((item) => {
        if (!item || typeof item.name !== 'string' || typeof item.reason !== 'string') {
          return null;
        }

        const canonicalName = productsByName.get(item.name.toLowerCase().trim());
        if (!canonicalName) {
          return null;
        }

        return { name: canonicalName, reason: item.reason };
      })
      .filter((item): item is Recommendation => item !== null)
      .slice(0, 3);

    return Response.json({ recommendations });
  } catch {
    return Response.json({ message: 'Failed to generate recommendations.' }, { status: 500 });
  }
}
