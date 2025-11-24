import { News, Publisher } from '@prisma/client';

export const triggerWebhook = async (
  publisher: Publisher,
  news: News
): Promise<void> => {
  if (!publisher.webhookUrl) return;

  try {
    const payload = {
      event: 'news.viewed',
      timestamp: new Date().toISOString(),
      data: {
        newsId: news.id,
        newsTitle: news.title,
        viewCount: news.viewCount,
      },
    };

    await fetch(publisher.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NewsAPI-Webhook/1.0',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Webhook delivery failed:', error);
    // Don't throw - webhook failures shouldn't break the main flow
  }
};