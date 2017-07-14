<div style="display:none;">
    <div itemscope="" itemtype="http://schema.org/Organization">
        <a itemprop="url" href="/" title="<?=$name?>">
            <img itemprop="logo" src="<?=$logo?>" alt="<?=$name?>">
        </a>
        <span itemprop="name"><?=$name?></span>
        <div itemprop="address" itemscope="" itemtype="http://schema.org/PostalAddress">
            <span itemprop="postalCode"><?=$index?></span>
            <span itemprop="addressLocality"><?=$city?></span>
            <span itemprop="streetAddress"><?=$address?></span>
        </div>
        <div>
            <span itemprop="telephone"><?=$phone?></span>
        </div>
        <div>
            <span itemprop="email"><?=$email?></span>,
        </div>
    </div>
</div>