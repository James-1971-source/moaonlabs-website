import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { services } from '@/lib/services';
import { ServiceDetail } from '@/components/moaon';
export function generateStaticParams() { return services.map(s=>({slug:s.slug})); }
export const dynamicParams = false;
export async function generateMetadata({params}: {params: Promise<{slug:string}>}): Promise<Metadata> { const {slug}=await params; const s=services.find(s=>s.slug===slug); return { title:s?.name || '서비스', description:s?.description }; }
export default async function ServicePage({params}: {params: Promise<{slug:string}>}) { const {slug}=await params; const service=services.find(s=>s.slug===slug); if(!service) notFound(); return <ServiceDetail service={service}/>; }
