
import { GoogleGenAI } from "@google/genai";
import { Order, OrderStatus } from "../types";

// Initializing the Google GenAI client with the mandatory named parameter for the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getOrderSummary(order: Order): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very short, professional internal note for a laundry staff regarding this order:
      Customer: ${order.customer.firstName} ${order.customer.lastName}
      Items: ${order.details.itemCount}
      Service: ${order.details.serviceType}
      Notes: ${order.details.notes || 'None'}
      Status: ${order.status}
      
      Keep it under 20 words. Focus on urgency or special care if applicable.`,
      config: {
        systemInstruction: "You are a laundry shop operations expert helping the staff manage tasks efficiently.",
        temperature: 0.5,
      },
    });
    // The .text property is used directly (not a method) to retrieve the generated text content.
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating insights.";
  }
}

export async function getDailyBriefing(orders: Order[]): Promise<string> {
  try {
    const activeOrders = orders.filter(o => o.status !== OrderStatus.DELIVERED);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You have ${activeOrders.length} active orders. 
      Details: ${JSON.stringify(activeOrders.map(o => ({id: o.id, status: o.status, date: o.details.pickupDate})))}
      Provide a brief priority update (2 sentences) for the shop manager.`,
      config: {
        systemInstruction: "You are a business consultant for a high-end laundry shop.",
        temperature: 0.7,
      },
    });
    // The .text property is used directly to retrieve the generated text content.
    return response.text || "Keep up the good work!";
  } catch (error) {
    return "Operational summary unavailable.";
  }
}
