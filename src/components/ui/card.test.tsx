import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  StatCard,
  StatCardValue,
  StatCardLabel,
  StatCardTrend,
} from './card';

describe('StatCard', () => {
  it('should render with default props', () => {
    const { container } = render(
      <StatCard>
        <StatCardValue>100</StatCardValue>
        <StatCardLabel>Total Users</StatCardLabel>
      </StatCard>
    );

    const statCard = container.querySelector('[data-slot="stat-card"]');
    expect(statCard).toBeInTheDocument();
    expect(statCard).toHaveAttribute('data-size', 'default');
    expect(statCard).not.toHaveAttribute('data-loading');
  });

  it('should render with different sizes', () => {
    const { container: defaultContainer, rerender } = render(
      <StatCard size="default">
        <StatCardValue>100</StatCardValue>
      </StatCard>
    );
    expect(defaultContainer.querySelector('[data-size="default"]')).toBeInTheDocument();

    rerender(
      <StatCard size="sm">
        <StatCardValue>100</StatCardValue>
      </StatCard>
    );
    expect(defaultContainer.querySelector('[data-size="sm"]')).toBeInTheDocument();

    rerender(
      <StatCard size="lg">
        <StatCardValue>100</StatCardValue>
      </StatCard>
    );
    expect(defaultContainer.querySelector('[data-size="lg"]')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const { container } = render(
      <StatCard loading>
        <StatCardValue>100</StatCardValue>
      </StatCard>
    );

    const statCard = container.querySelector('[data-slot="stat-card"]');
    expect(statCard).toHaveAttribute('data-loading', 'true');
  });
});

describe('StatCardValue', () => {
  it('should render value content', () => {
    const { container } = render(<StatCardValue>1,234</StatCardValue>);

    const value = container.querySelector('[data-slot="stat-card-value"]');
    expect(value).toBeInTheDocument();
    expect(value).toHaveTextContent('1,234');
  });

  it('should apply trend colors', () => {
    const { container: upContainer } = render(
      <StatCardValue trend="up">+12.5%</StatCardValue>
    );
    expect(upContainer.querySelector('[data-trend="up"]')).toHaveClass('text-emerald-500');

    const { container: downContainer } = render(
      <StatCardValue trend="down">-5.2%</StatCardValue>
    );
    expect(downContainer.querySelector('[data-trend="down"]')).toHaveClass('text-red-500');

    const { container: neutralContainer } = render(
      <StatCardValue trend="neutral">0%</StatCardValue>
    );
    expect(neutralContainer.querySelector('[data-trend="neutral"]')).not.toHaveClass('text-emerald-500');
    expect(neutralContainer.querySelector('[data-trend="neutral"]')).not.toHaveClass('text-red-500');
  });
});

describe('StatCardLabel', () => {
  it('should render label text', () => {
    const { container } = render(<StatCardLabel>Total Revenue</StatCardLabel>);

    const label = container.querySelector('[data-slot="stat-card-label"]');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Total Revenue');
  });

  it('should apply muted foreground color', () => {
    const { container } = render(<StatCardLabel>Active Sessions</StatCardLabel>);

    const label = container.querySelector('[data-slot="stat-card-label"]');
    expect(label).toHaveClass('text-muted-foreground');
  });
});

describe('StatCardTrend', () => {
  it('should render with up variant', () => {
    const { container } = render(<StatCardTrend variant="up">+15%</StatCardTrend>);

    const trend = container.querySelector('[data-slot="stat-card-trend"]');
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveAttribute('data-variant', 'up');
    expect(trend).toHaveClass('text-emerald-500');
  });

  it('should render with down variant', () => {
    const { container } = render(<StatCardTrend variant="down">-8%</StatCardTrend>);

    const trend = container.querySelector('[data-slot="stat-card-trend"]');
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveAttribute('data-variant', 'down');
    expect(trend).toHaveClass('text-red-500');
  });

  it('should render with neutral variant', () => {
    const { container } = render(<StatCardTrend variant="neutral">0%</StatCardTrend>);

    const trend = container.querySelector('[data-slot="stat-card-trend"]');
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveAttribute('data-variant', 'neutral');
    expect(trend).toHaveClass('text-muted-foreground');
  });

  it('should render default neutral variant', () => {
    const { container } = render(<StatCardTrend>0%</StatCardTrend>);

    const trend = container.querySelector('[data-slot="stat-card-trend"]');
    expect(trend).toHaveAttribute('data-variant', 'neutral');
  });

  it('should render SVG icon', () => {
    const { container } = render(<StatCardTrend variant="up">+10%</StatCardTrend>);

    const trend = container.querySelector('[data-slot="stat-card-trend"]');
    expect(trend?.querySelector('svg')).toBeInTheDocument();
  });
});