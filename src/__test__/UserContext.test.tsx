import { render, screen, fireEvent } from '@testing-library/react';
import { UserProvider } from '../contexts/UserContext';
import { useUser } from '../contexts/useUser';

// Komponen sementara untuk menguji UserContext
const TestComponent = () => {
  const { userType, setUserType } = useUser();

  return (
    <div>
      <span data-testid='user-type'>{userType}</span>
      <button onClick={() => setUserType('admin')}>Change to Admin</button>
    </div>
  );
};

describe('UserContext', () => {
  // Test 1: Memastikan konteks memberikan nilai yang benar
  it('should provide the correct initial userType value', () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    const userTypeElement = screen.getByTestId('user-type');
    expect(userTypeElement).toHaveTextContent('user');
  });

  // Test 2: Memastikan setUserType berfungsi untuk memperbarui nilai
  it('should update userType when setUserType is called', () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    const button = screen.getByText('Change to Admin');
    fireEvent.click(button);

    const userTypeElement = screen.getByTestId('user-type');
    expect(userTypeElement).toHaveTextContent('admin');
  });

  // Test 3: Memastikan useUser melempar error jika digunakan di luar UserProvider
  it('should throw an error when useUser is used outside of UserProvider', () => {
    let error: Error | undefined;

    try {
      render(<TestComponent />);
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeDefined();
    expect(error?.message).toBe('useUser must be used within a UserProvider');
  });
});
