import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const LALAMOVE_MARKET = 'ID';

export const signLalamove = (secret: string, method: string, path: string, body: string = '') => {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`)
    .digest('hex');
  return { timestamp, signature };
};

export async function getQuotationLalamove(
  pickup: { lat: number; lng: number; address: string },
  dropoff: { lat: number; lng: number; address: string },
  serviceType = 'MOTORCYCLE',
  weight = 1
) {
  const { LALAMOVE_KEY, LALAMOVE_SECRET } = process.env;
  if (!LALAMOVE_KEY || !LALAMOVE_SECRET) return { error: 'Lalamove key tidak ditemukan' };

  const body = {
    data: {
      serviceType,
      stops: [
        { coordinates: { lat: pickup.lat, lng: pickup.lng }, address: pickup.address },
        { coordinates: { lat: dropoff.lat, lng: dropoff.lng }, address: dropoff.address }
      ],
      item: { weight: weight > 3 ? 'GREATER_THAN_3KG' : 'LESS_THAN_3KG', quantity: 1, categories: ['GENERAL'] }
    }
  };

  const path = '/v3/quotations';
  const { timestamp, signature } = signLalamove(LALAMOVE_SECRET, 'POST', path, JSON.stringify(body));
  const token = `${LALAMOVE_KEY}:${timestamp}:${signature}`;

  const res = await fetch(`https://rest.sandbox.lalamove.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `hmac ${token}`,
      'Market': LALAMOVE_MARKET,
      'Request-ID': crypto.randomUUID()
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`Lalamove error ${res.status}`);
  const data = await res.json();
  return data.data;
}

export async function placeLalamoveOrder(quotationId: string, senderPhone: string, recipientPhone: string) {
  const { LALAMOVE_KEY, LALAMOVE_SECRET } = process.env;
  if (!LALAMOVE_KEY || !LALAMOVE_SECRET) throw new Error('Lalamove key tidak ditemukan');

  const body = {
    data: {
      quotationId,
      sender: { stopId: '1', name: 'Seller', phone: senderPhone },
      recipients: [{ stopId: '2', name: 'Buyer', phone: recipientPhone }]
    }
  };

  const path = '/v3/orders';
  const { timestamp, signature } = signLalamove(LALAMOVE_SECRET, 'POST', path);
  const token = `${LALAMOVE_KEY}:${timestamp}:${signature}`;

  const res = await fetch(`https://rest.sandbox.lalamove.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `hmac ${token}`,
      'Market': LALAMOVE_MARKET,
      'Request-ID': crypto.randomUUID()
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`Lalamove order error ${res.status}`);
  return await res.json();
}

export async function getLalamoveOrder(orderId: string) {
  const { LALAMOVE_KEY, LALAMOVE_SECRET } = process.env;
  if (!LALAMOVE_KEY || !LALAMOVE_SECRET) throw new Error('Lalamove key tidak ditemukan');

  const path = `/v3/orders/${orderId}`;
  const { timestamp, signature } = signLalamove(LALAMOVE_SECRET, 'GET', path);
  const token = `${LALAMOVE_KEY}:${timestamp}:${signature}`;

  const res = await fetch(`https://rest.sandbox.lalamove.com${path}`, {
    headers: {
      'Authorization': `hmac ${token}`,
      'Market': LALAMOVE_MARKET,
      'Request-ID': crypto.randomUUID()
    }
  });

  if (!res.ok) throw new Error(`Lalamove get order error`);
  return await res.json();
}