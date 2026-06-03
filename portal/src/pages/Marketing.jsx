import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas-pro';
import {
  MessageCircle, Camera, Printer, Download, Palette, LayoutGrid, QrCode,
  Shuffle, ArrowLeft, ArrowRight, Touchpad,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PACKAGES = [
  { name: "The Minimalist", duration: "2 Hours" },
  { name: "The Signature", duration: "3 Hours" },
  { name: "The Studio Pro", duration: "4 Hours" },
  { name: "The All-Day", duration: "8 Hours" },
];

const ITEM_NAMES = ['Good Vibes','Bad Decisions','Y2K Energy','Main Character','Plot Twist','CEO of Fun','No Cap','Zero Chill','Vibe Check','Slay','Receipts','Best Day Ever','Glow Up','Rizz','Small Talk','Photo Finish','Frame It','Strike A Pose','Memory Lane','Laugh Track'];
const PRICES = [0,100,500,777,999,1000];
const TITLES = ['Good Vibes Co.','Main Character Inc.','Best Day Ever','Receipts Only','Zero Chill Lounge','Plot Twist Events','The Vibe Check','Memory Makers','Laugh Track Studio','Photo Finish','Glow Up Booth','Strike A Pose'];
const SUBTITLES = ["Show 'em the receipts!",'No proof without receipts','The Wedding','The Birthday','Best Moments','Captured','Forever Young','Big Day','Official Receipt','Certified Fun','One for the books','Making memories','Picture perfect','The main event','Cheers to us'];
const FOOTERS = ['Thank you for the memories!','See you next time!','Best day ever!','Making memories since 2025','Keep the receipt!','Good vibes only','Until next time!','Thanks for stopping by!','Smile always!','Moments over everything'];
const CUSTOM_TEXTS = ['Good Vibes Only','Best Day Ever','No Cap','Main Character Energy','Zero Chill','Plot Twist','Receipts Only','One for the books','Picture perfect','Certified fun','Glow up season','Strike a pose'];

function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function generateItems(){const count=Math.floor(Math.random()*3)+1;const items=[];for(let i=0;i<count;i++)items.push({name:pick(ITEM_NAMES),price:pick(PRICES)});return items;}
function generateState(){return{showDate:Math.random()>0.3,showDividerBefore:Math.random()>0.3,showDividerAfter:Math.random()>0.3,showCustomText:Math.random()>0.4,showItems:Math.random()>0.3,showFooter:Math.random()>0.3,title:pick(TITLES),subtitle:pick(SUBTITLES),footerText:pick(FOOTERS),customText:pick(CUSTOM_TEXTS),items:generateItems()};}

async function downloadPng(element,filename,scale=3){
  if(!element)return;
  let target=element;
  let tempContainer=null;
  try{
    // If element lives inside a CSS-columns container, clone it to a temp
    // fixed-position div so html2canvas renders it correctly.
    const inColumn=element.closest('.columns-2,.columns-3,[style*="column-count"]')!==null;
    if(inColumn){
      const clone=element.cloneNode(true);
      tempContainer=document.createElement('div');
      tempContainer.style.position='fixed';
      tempContainer.style.left='-9999px';
      tempContainer.style.top='0';
      tempContainer.style.width=element.offsetWidth+'px';
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);
      target=clone;
      await new Promise(r=>requestAnimationFrame(r));
    }
    const canvas=await html2canvas(target,{scale,backgroundColor:'#ffffff',useCORS:true,allowTaint:true,logging:false});
    canvas.toBlob((blob)=>{
      if(!blob)return;
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.download=filename;
      link.href=url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },'image/png');
  }catch(err){
    console.error('Download failed:',err);
    alert('Download failed: '+err.message);
  }finally{
    if(tempContainer)tempContainer.remove();
  }
}

function AnimatedBlock({show,children,maxH='max-h-10'}){
  return <div className={`overflow-hidden transition-all duration-1000 ease-out ${show?`${maxH} opacity-100 mt-0`:'max-h-0 opacity-0 mt-0'}`}>{children}</div>;
}

function SectionDownload({label,onDownload}){
  return <button onClick={onDownload} className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-bold hover:opacity-90 transition border-2 border-black"><Download className="w-4 h-4"/>{label}</button>;
}

function MarketingPrintLayoutCard({name,shots,children}){
  const [cardState,setCardState]=useState(generateState);
  const cardRef=useRef(null);
  const handleRandomize=()=>setCardState(generateState());
  const handleDownload=()=>downloadPng(cardRef.current,`${name.replace(/\s+/g,'-').toLowerCase()}-preview.png`);
  return(
    <div className="flex flex-col items-center break-inside-avoid">
      <div ref={cardRef} className="w-full bg-white border-2 border-gray-200 rounded-lg p-3 flex flex-col text-center text-black overflow-hidden">
        <AnimatedBlock show={cardState.showDate}><p className="text-xs text-black/50">JUN 03, 2026 14:30</p></AnimatedBlock>
        <p className="text-sm font-bold leading-tight">{cardState.title}</p>
        <p className="text-xs text-black mb-1">{cardState.subtitle}</p>
        <AnimatedBlock show={cardState.showDividerBefore}><div className="w-full border-t-2 border-dashed border-black my-1.5"/></AnimatedBlock>
        {children}
        <AnimatedBlock show={cardState.showDividerAfter}><div className="w-full border-t-2 border-dashed border-black my-1.5"/></AnimatedBlock>
        <AnimatedBlock show={cardState.showCustomText} maxH="max-h-8"><p className="text-xs text-black font-medium tracking-wide">{cardState.customText}</p></AnimatedBlock>
        <AnimatedBlock show={cardState.showItems} maxH="max-h-32">
          <div className="text-xs text-black space-y-0.5 text-left px-1">{cardState.items.map((item,i)=><div key={i} className="flex justify-between"><span>{item.name}</span><span>{item.price}</span></div>)}</div>
        </AnimatedBlock>
        <AnimatedBlock show={cardState.showFooter}><p className="text-xs text-black mt-1">{cardState.footerText}</p></AnimatedBlock>
      </div>
      <p className="text-xs font-semibold text-black mt-2">{name}</p>
      <p className="text-xs text-black">{shots}</p>
      <div className="flex items-center gap-2 mt-2">
        <button onClick={handleRandomize} className="inline-flex items-center gap-1 text-xs bg-black text-white px-3 py-1.5 font-bold hover:opacity-90 transition border border-black"><Shuffle className="w-3 h-3"/>Randomize</button>
        <button onClick={handleDownload} className="inline-flex items-center gap-1 text-xs bg-white text-black px-3 py-1.5 font-bold hover:bg-gray-100 transition border-2 border-black"><Download className="w-3 h-3"/>Download</button>
      </div>
    </div>
  );
}

function MarketingStepCard({icon,number,title,description}){
  const ref=useRef(null);
  return(
    <div ref={ref} className="border-2 border-gray-200 rounded-lg p-6 flex flex-col items-center text-center bg-white">
      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-4">{icon}</div>
      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold mb-3">{number}</div>
      <h3 className="font-bold text-black mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      <button onClick={()=>downloadPng(ref.current,`step-${number}-${title.replace(/\s+/g,'-').toLowerCase()}.png`)} className="mt-4 inline-flex items-center gap-1 text-xs bg-white text-black px-3 py-1.5 font-bold hover:bg-gray-100 transition border-2 border-black"><Download className="w-3 h-3"/>Download</button>
    </div>
  );
}

function MarketingFeatureCard({icon,title,desc}){
  const ref=useRef(null);
  return(
    <div ref={ref} className="flex flex-col items-center text-center p-4 border-2 border-gray-100 rounded-lg bg-white">
      {icon}<p className="text-sm font-semibold text-black">{title}</p><p className="text-xs text-gray-500 mt-1">{desc}</p>
      <button onClick={()=>downloadPng(ref.current,`feature-${title.replace(/\s+/g,'-').toLowerCase()}.png`)} className="mt-3 inline-flex items-center gap-1 text-xs bg-white text-black px-3 py-1.5 font-bold hover:bg-gray-100 transition border-2 border-black"><Download className="w-3 h-3"/>Download</button>
    </div>
  );
}

function MarketingPackageCard({pkg}){
  const ref=useRef(null);
  return(
    <div ref={ref} className="border-2 border-gray-200 p-8 bg-white flex flex-col items-center text-center">
      <h3 className="font-bold text-black text-xl mb-2">{pkg.name}</h3><p className="text-gray-500 text-sm">{pkg.duration}</p>
      <button onClick={()=>downloadPng(ref.current,`package-${pkg.name.replace(/\s+/g,'-').toLowerCase()}.png`)} className="mt-4 inline-flex items-center gap-1 text-xs bg-white text-black px-3 py-1.5 font-bold hover:bg-gray-100 transition border-2 border-black"><Download className="w-3 h-3"/>Download</button>
    </div>
  );
}

export default function Marketing(){
  const navigate=useNavigate();
  const [loading,setLoading]=useState(true);
  const heroRef=useRef(null);
  const stepsRef=useRef(null);
  const layoutsRef=useRef(null);
  const featuresRef=useRef(null);
  const packagesRef=useRef(null);

  useEffect(()=>{
    async function checkAuth(){
      const {data:{session}}=await supabase.auth.getSession();
      if(!session){navigate('/admin',{replace:true});}else{setLoading(false);}
    }checkAuth();
  },[navigate]);

  if(loading)return<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin"/></div>;

  return(
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">Marketing Assets</h1>
        <Link to="/" className="text-sm text-black hover:opacity-70 transition inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5"/>Back to site</Link>
      </div>
      <hr className="border-gray-200 max-w-4xl mx-auto"/>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">Hero Banner</h2>
          <SectionDownload label="Download Hero" onDownload={()=>downloadPng(heroRef.current,'hero-banner.png')}/>
        </div>
        <div ref={heroRef} className="bg-white border-2 border-gray-200 p-12 text-center">
          <img src="/mono-booth-ph.svg" alt="MONO BOOTH PH" className="w-20 h-20 object-contain brightness-0 mx-auto mb-10"/>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">MONO BOOTH PH</h1>
          <p className="text-2xl md:text-3xl text-black leading-relaxed mb-0 max-w-2xl mx-auto">No proof without @monoboothph.</p>
          <p className="text-2xl md:text-3xl text-black leading-relaxed mb-8 max-w-2xl mx-auto">Show 'em the receipts.</p>
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 font-bold">
              <MessageCircle className="w-5 h-5"/>Book via Messenger<ArrowRight className="w-5 h-5"/>
            </div>
          </div>
        </div>
      </section>
      <hr className="border-gray-200 max-w-4xl mx-auto"/>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">How It Works</h2>
          <SectionDownload label="Download Steps" onDownload={()=>downloadPng(stepsRef.current,'how-it-works.png')}/>
        </div>
        <div ref={stepsRef} className="bg-white border-2 border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-black mb-6 text-center">Three Steps, Zero Chill</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MarketingStepCard icon={<Touchpad className="w-6 h-6"/>} number="1" title="Tap to Start" description="Guests tap the screen and strike a pose. The booth walks them through the shots."/>
            <MarketingStepCard icon={<Camera className="w-6 h-6"/>} number="2" title="Capture" description="Multiple shots per session with a live preview. Choose your best pose."/>
            <MarketingStepCard icon={<Printer className="w-6 h-6"/>} number="3" title="Print & Download" description="Physical print in seconds. Digital copy available instantly via QR code."/>
          </div>
        </div>
      </section>
      <hr className="border-gray-200 max-w-4xl mx-auto"/>

      {/* Print Layouts */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">Pick Your Vibe</h2>
          <SectionDownload label="Download All Layouts" onDownload={()=>downloadPng(layoutsRef.current,'all-print-layouts.png')}/>
        </div>
        <div ref={layoutsRef} className="bg-white border-2 border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-black mb-6 text-center">Pick Your Vibe</h2>
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            <MarketingPrintLayoutCard name="Tall Order" shots="6 shots">
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-black rounded" style={{aspectRatio:'3/4'}}/><div className="bg-black rounded" style={{aspectRatio:'3/4'}}/>
                <div className="bg-black rounded" style={{aspectRatio:'3/4'}}/><div className="bg-black rounded" style={{aspectRatio:'3/4'}}/>
                <div className="bg-black rounded" style={{aspectRatio:'3/4'}}/><div className="bg-black rounded" style={{aspectRatio:'3/4'}}/>
              </div>
            </MarketingPrintLayoutCard>
            <MarketingPrintLayoutCard name="Solo Star" shots="1 shot">
              <div className="w-full bg-black rounded" style={{aspectRatio:'3/4'}}/>
            </MarketingPrintLayoutCard>
            <MarketingPrintLayoutCard name="Double Take" shots="2 shots">
              <div className="w-full bg-black rounded" style={{aspectRatio:'4/3'}}/><div className="w-full bg-black rounded mt-1" style={{aspectRatio:'4/3'}}/>
            </MarketingPrintLayoutCard>
            <MarketingPrintLayoutCard name="Triple Threat" shots="3 shots">
              <div className="w-full bg-black rounded" style={{aspectRatio:'4/3'}}/><div className="w-full bg-black rounded mt-0.5" style={{aspectRatio:'4/3'}}/><div className="w-full bg-black rounded mt-0.5" style={{aspectRatio:'4/3'}}/>
            </MarketingPrintLayoutCard>
            <MarketingPrintLayoutCard name="Wide Load" shots="6 shots">
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-black rounded" style={{aspectRatio:'4/3'}}/><div className="bg-black rounded" style={{aspectRatio:'4/3'}}/>
                <div className="bg-black rounded" style={{aspectRatio:'4/3'}}/><div className="bg-black rounded" style={{aspectRatio:'4/3'}}/>
                <div className="bg-black rounded" style={{aspectRatio:'4/3'}}/><div className="bg-black rounded" style={{aspectRatio:'4/3'}}/>
              </div>
            </MarketingPrintLayoutCard>
            <MarketingPrintLayoutCard name="Quad Squad" shots="4 shots">
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-black rounded" style={{aspectRatio:'3/4'}}/><div className="bg-black rounded" style={{aspectRatio:'3/4'}}/>
                <div className="bg-black rounded" style={{aspectRatio:'3/4'}}/><div className="bg-black rounded" style={{aspectRatio:'3/4'}}/>
              </div>
            </MarketingPrintLayoutCard>
          </div>
        </div>
      </section>
      <hr className="border-gray-200 max-w-4xl mx-auto"/>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">The Full Receipt</h2>
          <SectionDownload label="Download Features" onDownload={()=>downloadPng(featuresRef.current,'features.png')}/>
        </div>
        <div ref={featuresRef} className="bg-white border-2 border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-black mb-6 text-center">The Full Receipt</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MarketingFeatureCard icon={<Printer className="w-6 h-6 text-black mb-2" strokeWidth={2}/>} title="Unlimited Prints" desc="Print as many as you want"/>
            <MarketingFeatureCard icon={<Download className="w-6 h-6 text-black mb-2" strokeWidth={2}/>} title="Instant Digital" desc="Download via QR code"/>
            <MarketingFeatureCard icon={<Palette className="w-6 h-6 text-black mb-2" strokeWidth={2}/>} title="Custom Branding" desc="Your logo, your colors"/>
            <MarketingFeatureCard icon={<LayoutGrid className="w-6 h-6 text-black mb-2" strokeWidth={2}/>} title="6 Layouts" desc="Pick your style"/>
            <MarketingFeatureCard icon={<Camera className="w-6 h-6 text-black mb-2" strokeWidth={2}/>} title="Live Preview" desc="See before you shoot"/>
            <MarketingFeatureCard icon={<QrCode className="w-6 h-6 text-black mb-2" strokeWidth={2}/>} title="QR Access" desc="Scan to download"/>
          </div>
        </div>
      </section>
      <hr className="border-gray-200 max-w-4xl mx-auto"/>

      {/* Packages */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">Book Your Hours</h2>
          <SectionDownload label="Download Packages" onDownload={()=>downloadPng(packagesRef.current,'packages.png')}/>
        </div>
        <div ref={packagesRef} className="bg-white border-2 border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-black mb-12 text-center">Book Your Hours</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PACKAGES.map((pkg,index)=><MarketingPackageCard key={index} pkg={pkg}/>)}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16 text-center border-t-2 border-gray-200">
        <p className="text-sm font-bold text-black tracking-wider mb-2">MONO BOOTH PH</p>
        <p className="text-xs text-black tracking-widest uppercase">Marketing Asset Library</p>
      </div>
    </div>
  );
}
