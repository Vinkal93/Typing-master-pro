import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { ProfileProvider } from '@/context/ProfileContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthSession } from '@/types/institute';

describe('Professional UI/UX Redesign - Sidebar & Navigation Architecture', () => {
  const dummyAuthSession: AuthSession = {
    user: {
      id: 'teacher_1',
      username: 'sharma_sir',
      name: 'R. K. Sharma',
      role: 'teacher',
      salt: 'salt123',
      passwordHash: 'hash123',
      createdAt: Date.now(),
      isActive: true,
    },
    token: 'dummy_token',
    expiresAt: Date.now() + 3600000,
    isLocked: false,
  };

  it('renders sidebar with primary navigation items when expanded', () => {
    const onNavigateMock = vi.fn();
    const onToggleCollapseMock = vi.fn();

    render(
      <ThemeProvider>
        <ProfileProvider>
          <Sidebar
            activeView="dashboard"
            onNavigate={onNavigateMock}
            isCollapsed={false}
            onToggleCollapse={onToggleCollapseMock}
            isMobileOpen={false}
            onCloseMobile={() => {}}
            authSession={null}
            onOpenSettings={() => {}}
            onOpenKeyboardRef={() => {}}
            onOpenProfileManager={() => {}}
            onOpenTeacherMode={() => {}}
          />
        </ProfileProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('Typing Master')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Learning')).toBeInTheDocument();
    expect(screen.getByText('Typing Practice')).toBeInTheDocument();
    expect(screen.getByText('Examinations')).toBeInTheDocument();
    expect(screen.getByText('Performance & Reports')).toBeInTheDocument();
    expect(screen.getByText('Character Learning')).toBeInTheDocument();
    expect(screen.getByText('Word Builder')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Layout Map')).toBeInTheDocument();
  });

  it('triggers navigation callback on item click', () => {
    const onNavigateMock = vi.fn();

    render(
      <ThemeProvider>
        <ProfileProvider>
          <Sidebar
            activeView="dashboard"
            onNavigate={onNavigateMock}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            isMobileOpen={false}
            onCloseMobile={() => {}}
            authSession={null}
            onOpenSettings={() => {}}
            onOpenKeyboardRef={() => {}}
            onOpenProfileManager={() => {}}
            onOpenTeacherMode={() => {}}
          />
        </ProfileProvider>
      </ThemeProvider>
    );

    const lmsBtn = screen.getByText('My Learning');
    fireEvent.click(lmsBtn);

    expect(onNavigateMock).toHaveBeenCalledWith('lms');
  });

  it('renders collapsed sidebar and displays tooltip attribute on hover', () => {
    render(
      <ThemeProvider>
        <ProfileProvider>
          <Sidebar
            activeView="dashboard"
            onNavigate={() => {}}
            isCollapsed={true}
            onToggleCollapse={() => {}}
            isMobileOpen={false}
            onCloseMobile={() => {}}
            authSession={null}
            onOpenSettings={() => {}}
            onOpenKeyboardRef={() => {}}
            onOpenProfileManager={() => {}}
            onOpenTeacherMode={() => {}}
          />
        </ProfileProvider>
      </ThemeProvider>
    );

    const dashboardBtn = screen.getByTitle('Student Dashboard');
    expect(dashboardBtn).toBeInTheDocument();
  });

  it('renders authorized institute entry when staff session is active', () => {
    render(
      <ThemeProvider>
        <ProfileProvider>
          <Sidebar
            activeView="dashboard"
            onNavigate={() => {}}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            isMobileOpen={false}
            onCloseMobile={() => {}}
            authSession={dummyAuthSession}
            onOpenSettings={() => {}}
            onOpenKeyboardRef={() => {}}
            onOpenProfileManager={() => {}}
            onOpenTeacherMode={() => {}}
          />
        </ProfileProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('Institute Console')).toBeInTheDocument();
  });

  it('renders TopHeader with breadcrumbs and title matching active view', () => {
    render(
      <ThemeProvider>
        <ProfileProvider>
          <TopHeader
            activeView="word_builder"
            onToggleMobileSidebar={() => {}}
            onOpenSettings={() => {}}
            onOpenProfileManager={() => {}}
            onAddNewStudent={() => {}}
            onOpenTeacherMode={() => {}}
            onNavigateHome={() => {}}
            authSession={null}
          />
        </ProfileProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Learning Tools')).toBeInTheDocument();
    expect(screen.getByText('Word & Syllable Builder')).toBeInTheDocument();
  });
});
