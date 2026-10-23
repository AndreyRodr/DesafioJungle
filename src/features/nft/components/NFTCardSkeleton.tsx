export function NFTCardSkeleton() {
  return (
    <div aria-hidden="true" className="min-w-0">
      <div className="rounded-2xl bg-[#2a1914] p-2">
        <div className="nft-shimmer aspect-square rounded-xl" />
      </div>

      <div className="mt-3 space-y-2 px-1">
        <div className="nft-shimmer h-4 w-4/5 rounded" />
        <div className="nft-shimmer h-4 w-2/5 rounded" />
      </div>
    </div>
  )
}
