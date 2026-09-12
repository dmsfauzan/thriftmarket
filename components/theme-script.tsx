export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var v=localStorage.getItem('thrift-theme');if(v==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
      }}
    />
  );
}
