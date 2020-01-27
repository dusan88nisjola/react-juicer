import * as React from 'react';
import {
  AnchorButton,
  Button,
  ChevronLeft,
  ChevronRight,
  Comments,
  Cross,
  FeedItem,
  FeedItemBackgroundImage,
  FeedItemHover,
  FeedItemImageContainer,
  FeedWrapper,
  Heart,
  LoadMoreContainer,
  Modal,
  ModalAvatar,
  ModalAvatarContainer,
  ModalButtonContainer,
  ModalClose,
  ModalContentContainer,
  ModalContentWrapper,
  ModalImageContainer,
  ModalMessage,
  ModalNext,
  ModalPrevious,
} from './index';
import BottomScrollListener from 'react-bottom-scroll-listener';
import { ThemeProvider } from 'styled-components';
import defaultsDeep from 'lodash/defaultsDeep';
import * as styles from '../styles';

interface JuicerItemProps {
  additional_photos?: any;
  comment_count?: number;
  comments?: number;
  deleted_at?: any;
  deleted_by?: any;
  description?: any;
  edit?: any;
  external_created_at: string;
  external_id: string;
  external?: any;
  feed: string;
  full_url: string;
  height: number;
  id: number;
  image: undefined | string;
  like_count: number;
  likes: number;
  location: string;
  message: string;
  position?: string;
  poster_display_name?: string;
  poster_id?: number;
  poster_image?: string;
  poster_name: string;
  poster_url: string;
  source: {
    id: number;
    options: any;
    queue?: any;
    source: string;
    term_type: string;
    term: string;
  };
  tagged_users?: any;
  unformatted_message: string;
  width: number;
}

interface Props {
  disableLoadMore: boolean;
  disableOnScroll?: boolean;
  feedId: string;
  imagesPer: number;
  initialLimit?: number;
  renderFail?: () => any;
  renderLoading?: () => any;
  theme?: any;
}

interface State {
  activeIndex: undefined | number;
  afterInitialLimit: boolean;
  currentPage: number;
  isOpen: boolean;
  juicerFeed: undefined | Array<JuicerItemProps>;
  loadedAll: boolean;
  loading: boolean;
  loadingMore: boolean;
}

class Juicer extends React.Component<Props, State> {
  static defaultProps = {
    disableLoadMore: false,
  };

  public state: State = {
    activeIndex: undefined,
    afterInitialLimit: false,
    currentPage: 1,
    isOpen: false,
    juicerFeed: undefined,
    loading: true,
    loadingMore: false,
    loadedAll: false,
  };

  componentDidMount() {
    const { feedId, imagesPer } = this.props;

    const { currentPage } = this.state;

    fetch(
      `https://www.juicer.io/api/feeds/${feedId}?per=${imagesPer}&page=${currentPage}`,
    )
      .then(response => response.json())
      .then(response => {
        this.setState({ loading: false, juicerFeed: response.posts.items });
      })
      .then(() => {
        const { juicerFeed } = this.state;

        if (juicerFeed) {
          juicerFeed.forEach((item, index) => {
            this.checkIfImageExists(item.image, index);
          });
        }
      });
  }

  checkIfImageExists(imageURL: undefined | string, index: number) {
    const image = new (window as any).Image();

    image.onerror = () => {
      const { juicerFeed } = this.state;

      if (juicerFeed) {
        juicerFeed[index].image = undefined;
      }

      this.forceUpdate();
    };
    image.src = imageURL;
  }

  addJuicerPage = () => {
    const { feedId, imagesPer } = this.props;

    const { juicerFeed, currentPage } = this.state;

    fetch(
      `https://www.juicer.io/api/feeds/${feedId}?per=${imagesPer}&page=${currentPage}`,
    )
      .then(response => response.json())
      .then(response => {
        console.log(response.posts.items);
        this.setState({
          juicerFeed:
            juicerFeed &&
            juicerFeed.concat(
              response.posts.items.filter(
                (item: any) => item.height !== null && item.image !== null,
              ),
            ),
          loadingMore: false,
          loadedAll: response.posts.items.length > 0 ? false : true,
        });
      })
      .then(() => {
        if (juicerFeed) {
          juicerFeed.slice(imagesPer * currentPage).forEach((item, index) => {
            this.checkIfImageExists(
              item.image,
              imagesPer * currentPage + index,
            );
          });
        }
      });
  };

  handleLoadMore = () => {
    const { juicerFeed, currentPage, loadingMore } = this.state;

    if (!loadingMore) {
      this.setState(
        {
          afterInitialLimit: true,
          currentPage: currentPage + 1,
          loadingMore: true,
        },
        () => {
          if (juicerFeed) {
            this.addJuicerPage();
          }
        },
      );
    }
  };

  render() {
    const {
      activeIndex,
      afterInitialLimit,
      isOpen,
      juicerFeed,
      loadedAll,
      loading,
      loadingMore,
    } = this.state;

    const {
      disableLoadMore,
      disableOnScroll,
      initialLimit,
      theme,
      renderLoading,
      renderFail,
    } = this.props;

    if (loading) {
      return <div>{renderLoading ? renderLoading() : 'loading'}</div>;
    }

    if (!juicerFeed) {
      return <div>{renderFail ? renderFail() : 'could not load feed'}</div>;
    }

    const filteredJuicer = (() =>
      juicerFeed
        .filter(item => item.image !== undefined)
        .filter(
          (item, index) =>
            afterInitialLimit || !initialLimit || index < initialLimit,
        ))();

    const activeJuice = (() => {
      if (activeIndex !== undefined && activeIndex > -1) {
        return filteredJuicer[activeIndex];
      } else {
        return undefined;
      }
    })();

    return (
      <ThemeProvider theme={defaultsDeep({ ...theme }, styles.defaultTheme)}>
        <>
          <FeedWrapper>
            {filteredJuicer.map(
              ({ comment_count, id, image, like_count }, index) => (
                <FeedItem
                  key={id}
                  onClick={() =>
                    this.setState({ isOpen: true, activeIndex: index })
                  }
                >
                  <FeedItemBackgroundImage
                    style={{ backgroundImage: `url(${image})` }}
                  >
                    <FeedItemImageContainer>
                      <img src={image} alt="" />
                    </FeedItemImageContainer>
                    <FeedItemHover>
                      <div>
                        <Comments />
                        {comment_count}
                      </div>
                      <div>
                        <Heart /> {like_count}
                      </div>
                    </FeedItemHover>
                  </FeedItemBackgroundImage>
                </FeedItem>
              ),
            )}
            <BottomScrollListener
              onBottom={disableOnScroll ? () => {} : this.handleLoadMore}
            />
          </FeedWrapper>
          {!disableLoadMore && !loadedAll && (
            <LoadMoreContainer>
              <Button
                className="button large"
                onClick={() => {
                  this.handleLoadMore();
                }}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </Button>
            </LoadMoreContainer>
          )}
          {activeJuice && (
            <Modal
              isOpen={isOpen}
              onRequestClose={() =>
                this.setState({ isOpen: false, activeIndex: undefined })
              }
              ariaHideApp={false}
            >
              <ModalContentWrapper>
                <ModalImageContainer
                  style={{ backgroundImage: `url('${activeJuice.image}')` }}
                >
                  <ModalPrevious
                    type="button"
                    onClick={() => {
                      this.setState({
                        activeIndex:
                          activeIndex && activeIndex !== 0
                            ? activeIndex - 1
                            : 0,
                      });
                    }}
                  >
                    <ChevronLeft />
                  </ModalPrevious>
                  <ModalNext
                    type="button"
                    onClick={() => {
                      this.setState({
                        activeIndex:
                          activeIndex &&
                          activeIndex !== filteredJuicer.length - 1
                            ? activeIndex + 1
                            : filteredJuicer.length - 1,
                      });
                    }}
                  >
                    <ChevronRight />
                  </ModalNext>
                </ModalImageContainer>
                <ModalContentContainer>
                  <ModalAvatarContainer>
                    <div>
                      <ModalAvatar
                        style={{
                          backgroundImage: `url('${activeJuice.poster_image}')`,
                        }}
                      />
                    </div>
                    <div>
                      {activeJuice.poster_display_name &&
                      activeJuice.poster_display_name.length
                        ? activeJuice.poster_display_name
                        : activeJuice.poster_name}
                    </div>
                  </ModalAvatarContainer>
                  <ModalMessage>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: activeJuice.message,
                      }}
                    />
                  </ModalMessage>
                  <ModalButtonContainer>
                    <AnchorButton
                      href={activeJuice.full_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on {activeJuice.source.source}
                    </AnchorButton>
                  </ModalButtonContainer>
                </ModalContentContainer>
                <ModalClose
                  type="button"
                  onClick={() => {
                    this.setState({ isOpen: false, activeIndex: undefined });
                  }}
                >
                  <Cross />
                </ModalClose>
              </ModalContentWrapper>
            </Modal>
          )}
        </>
      </ThemeProvider>
    );
  }
}

export default Juicer;
