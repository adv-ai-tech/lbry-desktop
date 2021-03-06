// @flow
import React, { PureComponent, Fragment } from 'react';
import BusyIndicator from 'component/common/busy-indicator';
import RewardListClaimed from 'component/rewardListClaimed';
import RewardTile from 'component/rewardTile';
import Button from 'component/button';
import Page from 'component/page';
import classnames from 'classnames';
import type { Reward } from 'types/reward';
import { rewards as REWARD_TYPES } from 'lbryinc';

type Props = {
  doAuth: () => void,
  navigate: string => void,
  fetching: boolean,
  rewards: Array<Reward>,
  claimed: Array<Reward>,
  user: ?{
    is_identity_verified: boolean,
    is_reward_approved: boolean,
    primary_email: string,
    has_verified_email: boolean,
  },
  daemonSettings: {
    share_usage_data: boolean,
  },
};

class RewardsPage extends PureComponent<Props> {
  renderPageHeader() {
    const { doAuth, navigate, user, daemonSettings } = this.props;

    if (user && !user.is_reward_approved && daemonSettings && daemonSettings.share_usage_data) {
      if (!user.primary_email || !user.has_verified_email || !user.is_identity_verified) {
        return (
          <section className="card card--section">
            <header className="card__header">
              <h2 className="card__title">{__('Humans Only')}</h2>
              <p className="card__subtitle">
                {__('Rewards are for human beings only.')}{' '}
                {__("You'll have to prove you're one of us before you can claim any rewards.")}
              </p>
            </header>

            <div className="card__content">
              <Button onClick={doAuth} button="primary" label="Prove Humanity" />
            </div>
          </section>
        );
      }
      return (
        <div className="card__content">
          <p>
            {__(
              'This account must undergo review before you can participate in the rewards program.'
            )}{' '}
            {__('This can take anywhere from several minutes to several days.')}
          </p>

          <p>
            {__(
              'We apologize for this inconvenience, but have added this additional step to prevent fraud.'
            )}
          </p>
          <p>
            {`${__('If you continue to see this message, send us an email to help@lbry.io.')} ${__(
              'Please enjoy free content in the meantime!'
            )}`}
          </p>
          <p>
            <Button onClick={() => navigate('/discover')} button="primary" label="Return Home" />
          </p>
        </div>
      );
    }

    return null;
  }

  renderCustomRewardCode() {
    return (
      <RewardTile
        key={REWARD_TYPES.TYPE_GENERATED_CODE}
        reward={{
          reward_type: REWARD_TYPES.TYPE_GENERATED_CODE,
          reward_title: __('Custom Code'),
          reward_description: __(
            'Are you a supermodel or rockstar that received a custom reward code? Claim it here.'
          ),
        }}
      />
    );
  }

  renderUnclaimedRewards() {
    const { fetching, rewards, user, daemonSettings, navigate, claimed } = this.props;

    if (daemonSettings && !daemonSettings.share_usage_data) {
      return (
        <section className="card card--section">
          <header className="card__header">
            <h2 className="card__title">{__('Disabled')}</h2>
          </header>

          <div className="card__content">
            <p>
              {__(
                'Rewards are currently disabled for your account. Turn on diagnostic data sharing, in'
              )}{' '}
              <Button button="link" onClick={() => navigate('/settings')} label="Settings" />
              {__(', in order to re-enable them.')}
            </p>
          </div>
        </section>
      );
    } else if (fetching) {
      return (
        <div className="card__content">
          <BusyIndicator message={__('Fetching rewards')} />
        </div>
      );
    } else if (user === null) {
      return (
        <div className="card__content">
          <p>
            {__('This application is unable to earn rewards due to an authentication failure.')}
          </p>
        </div>
      );
    } else if (!rewards || rewards.length <= 0) {
      return (
        <Fragment>
          <div className="card--section">
            <h2 className="card__title">{__('No Rewards Available')}</h2>
            <p>
              {claimed && claimed.length
                ? __(
                    "You have claimed all available rewards! We're regularly adding more so be sure to check back later."
                  )
                : __('There are no rewards available at this time, please check back later.')}
            </p>
          </div>

          <div className="card__content card__list--rewards">{this.renderCustomRewardCode()}</div>
        </Fragment>
      );
    }

    const isNotEligible =
      !user || !user.primary_email || !user.has_verified_email || !user.is_reward_approved;

    return (
      <div
        className={classnames('card__list--rewards', {
          'card--disabled': isNotEligible,
        })}
      >
        {rewards.map(reward => (
          <RewardTile key={reward.reward_type} reward={reward} />
        ))}
        {this.renderCustomRewardCode()}
      </div>
    );
  }

  render() {
    return (
      <Page>
        {this.renderPageHeader()}
        {this.renderUnclaimedRewards()}
        {<RewardListClaimed />}
      </Page>
    );
  }
}

export default RewardsPage;
