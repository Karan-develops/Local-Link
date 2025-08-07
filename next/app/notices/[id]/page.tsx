import { NoticeDetail } from "@/components/NoticeDetails";

export default async function NoticePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsId = (await paramsPromise).id;
  return <NoticeDetail noticeId={paramsId} />;
}
