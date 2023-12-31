import Link from 'next/link'
import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ProfileImage from './ProfileImage'
import { useSession } from 'next-auth/react'
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import IconHoverEffect from './IconHoverEffect'
import { api } from '~/utils/api'
import LoadingSpinner from './LoadingSpinner'



type Tweet = {
  id: string
  content: string
  createdAt: Date
  likeCount: number
  likedByMe: boolean
  user: { id: string, image: string | null; name: string | null }
}

type InfiniteTweetListItemProps = {
  isLoading: boolean
  isError: boolean
  hasMore: any
  fetchNewTweets: () => Promise<unknown>
  tweets?: Tweet[]
}

export default function InfiniteTweetList({ tweets, isLoading, isError, hasMore, fetchNewTweets }: InfiniteTweetListItemProps) {

  if (isLoading) return <LoadingSpinner />
  if (isError) return <h1>Error...</h1>

  if (tweets == null || tweets.length == 0) {
    return (
      <h2 className="text-2xl text-gray-500 my-4 text-center">
        No Tweets
      </h2>
    )
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={tweets.length}
        next={fetchNewTweets}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
      >
        {tweets.map((tweet) => {
          return <TweetCard key={tweet.id} {...tweet} />
        })}
      </InfiniteScroll>
    </ul>
  )
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "short" })

function TweetCard({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
}: Tweet) {

  //find the tweet which is being liked by user..

  const trpcUtils = api.useContext()
  
  const toggleLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<
      typeof trpcUtils.tweet.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        const countModifer = addedLike ? 1 : -1

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              tweets: page.tweets.map((tweet) => {
                if (tweet.id === id) {
                  return {
                    ...tweet,
                    likeCount: tweet.likeCount + countModifer,
                    likedByMe: addedLike,
                  }
                }

                return tweet
              }),
            }
          }),
        }
      } 

      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.tweet.infiniteFeed.setInfiniteData({ onlyFollowing: true}, updateData);

      trpcUtils.tweet.infiniteProfileFeed.setInfiniteData({userId: user.id}, updateData);

      
    }
  })

  function handleToggleLike() {
    toggleLike.mutate({ id })
  }

  return (
    <li className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>

      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link href={`/profiles/${user.id}`}
            className="font-semibold outline-none hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500 text-sm">
            {dateTimeFormatter.format(createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap">
          {content}
        </p>
        <HeartButton
        onClick={handleToggleLike}
        isLoading={toggleLike.isLoading} 
        likedByMe={likedByMe}
         likedCount={likeCount} />
      </div>
    </li>
  )
}

type HeartButtonProps = {
  onClick: () => void
  isLoading: boolean
  likedByMe: boolean
  likedCount: number
}

function HeartButton({
  onClick,
  isLoading,
  likedByMe,
  likedCount
}: HeartButtonProps) {

  const session = useSession()
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likedCount}</span>
      </div>
    )
  }

  return (
    <button
    disabled={isLoading}
    onClick={onClick}
      className={` group flex items-center gap-1 slef-start transition-colors duration-200 ml-2
                  ${likedByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
        }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${likedByMe
            ? " fill-red-500"
            : " group-focus-visible:fill-red--500"
            }`}
        />
      </IconHoverEffect>
      <span>{likedCount}</span>
    </button>
  )
}