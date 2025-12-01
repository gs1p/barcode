import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <img 
          src="/image2.png" 
          alt="Left Image" 
          className="header-image"
          style={{ maxWidth: '100px', height: 'auto' }}
        />
      </div>
      <div className="header-right">
        <img 
          src="/image1.png" 
          alt="Right Image" 
          className="header-image"
          style={{ maxWidth: '100px', height: 'auto' }}
        />
      </div>
    </header>
  );
}