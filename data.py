"""商品数据和返回日期"""

from datetime import datetime

PRODUCTS = [
    {"id":"G1001","name":"灵境AR隐形眼镜（全年订阅版）","category1":"智能穿戴","category2":"AR眼镜","brand":"幻视科技","spec":"LENS-AIR-01","color":"透明晶片","price":2999,"stock":"现货","launch":"2042-01-10","desc":"全天候AR增强现实隐形眼镜，支持全息界面、实时翻译、脑波轻触控","params":"分辨率:单眼8K,视场角:150°,续航:无线感应供电,重量:0.03g/片"},
    {"id":"G1002","name":"量子便携脑机接口（NeoLink）","category1":"智能穿戴","category2":"脑机接口","brand":"星脑科技","spec":"NL-PRO","color":"银灰","price":8999,"stock":"预约","launch":"2042-02-01","desc":"非侵入式脑机接口，支持意念控制智能家居、输入法、游戏操作","params":"传输速率:10Gbps,延迟:0.3ms,兼容设备:全屋智能/PC/VR,认证:脑机安全认证2042"},
    {"id":"G1003","name":"全自动分子料理烹饪台","category1":"家电厨电","category2":"智能厨电","brand":"食刻未来","spec":"CHEF-ONE","color":"曜石黑","price":18999,"stock":"现货","launch":"2042-01-05","desc":"内置分子食谱库，自动备料、烹饪、清洗，支持远程APP操控","params":"容量:4人份,食谱数量:5000+,支持食材识别,尺寸:900x600x450mm"},
    {"id":"G1004","name":"气凝胶自适应恒温外套","category1":"服装","category2":"外套","brand":"微气候","spec":"THERMO-X","color":"幻影灰/极地白/熔岩橙","price":1499,"stock":"现货","launch":"2042-01-15","desc":"根据环境温度和体感自动调节保暖/散热，可机洗500次以上","params":"温控范围:-20℃~45℃,面料:纳米气凝胶复合,防水等级:IPX7,续航:无线充/每月一次"},
    {"id":"G1005","name":"反重力悬浮滑板（城市版）","category1":"户外运动","category2":"滑板","brand":"重力科技","spec":"HOVER-ONE","color":"电光蓝","price":12999,"stock":"限量","launch":"2042-02-10","desc":"离地30cm悬浮滑行，最大时速60km/h，城市通勤新方式","params":"最大载重:120kg,续航:80km,充电时间:2小时,安全系统:自动避障+陀螺仪稳定"},
    {"id":"G1006","name":"全息AI私人助理（订阅）","category1":"数字服务","category2":"AI服务","brand":"2042 AI","spec":"ASSIST-2042","color":"数字全息","price":"299/月","stock":"现货","launch":"2042-01-01","desc":"立体全息投影AI，可对话、管理日程、控制家电，支持个性化人格定制","params":"支持设备:全息投影底座/AR眼镜,语音风格:可选12种,并发任务:20个"},
    {"id":"G1007","name":"碳纤维模块化折叠房","category1":"家居生活","category2":"模块住宅","brand":"巢居未来","spec":"MOD-HOME","color":"原色碳纤","price":189999,"stock":"预售","launch":"2042-03-01","desc":"30分钟展开为20㎡智能住宅，带水电循环系统，适合移动生活","params":"展开尺寸:5mx4mx2.8m,折叠尺寸:1.5mx2mx1m,能源:太阳能+储能电池,智能系统:全屋语音控制"},
    {"id":"G1008","name":"时光陈酿礼盒（2042限定）","category1":"食品酒饮","category2":"酒水","brand":"岁月酒庄","spec":"2042-LIMIT","color":"琥珀色","price":2599,"stock":"现货","launch":"2042-02-14","desc":"采用纳米加速发酵技术，模拟30年陈酿口感，限量5000盒","params":"酒精度:43%vol,容量:700ml,包装:智能恒温礼盒,赠品:数字藏品证书"},
    {"id":"G1009","name":"仿生陪伴机器人（宠物型）","category1":"机器人","category2":"陪伴机器人","brand":"灵宠工坊","spec":"PET-BOT-C","color":"白/橘/灰","price":4999,"stock":"现货","launch":"2042-01-20","desc":"仿生猫形态，情绪识别，可互动、可陪伴儿童老人，无需喂养","params":"传感器:触觉/视觉/声音,运动自由度:24个,续航:24小时,AI等级:情感计算L3"},
    {"id":"G1010","name":"太空植物生长舱（家庭版）","category1":"家居生活","category2":"智能种植","brand":"绿星科技","spec":"GROW-POD","color":"透明+白","price":3499,"stock":"现货","launch":"2042-01-25","desc":"自动调节光照、水分、营养液，可种植蔬菜、花卉，产量提高5倍","params":"种植容量:6株,生长周期缩短40%,APP远程监控,尺寸:600x400x500mm"},
    {"id":"G1011","name":"石墨烯快充移动能源站","category1":"数码配件","category2":"充电设备","brand":"能量方舟","spec":"POWER-HUB","color":"深空灰","price":899,"stock":"现货","launch":"2042-01-18","desc":"支持无线快充、太阳能补电，可同时为10台设备供电","params":"容量:50000mAh,输出:最高200W,无线充电协议:Qi-2042,太阳能充电:2小时补20%"},
    {"id":"G1012","name":"纳米护肤定制仪（家用版）","category1":"个护健康","category2":"美容仪","brand":"肤纪元","spec":"SKIN-2042","color":"珍珠白","price":3999,"stock":"现货","launch":"2042-02-05","desc":"扫描皮肤状态，现场制备纳米级精华液，即时导入","params":"精华配方库:2000+,扫描精度:毛孔级,单次护理时间:90秒,适用肤质:全部"},
    {"id":"G1013","name":"超导磁悬浮个人飞行器","category1":"出行交通","category2":"个人飞行器","brand":"天行科技","spec":"FLYER-S","color":"太空银","price":89999,"stock":"预售","launch":"2042-04-01","desc":"单人垂直起降飞行器，最高限速120km/h，自动航线规划","params":"最大航程:60km,最大载重:150kg,安全系统:多冗余螺旋桨+弹射降落伞,认证:低空适航证"},
    {"id":"G1014","name":"全息家庭影院墙","category1":"影音娱乐","category2":"投影设备","brand":"幻幕","spec":"HOLO-WALL","color":"隐形","price":14999,"stock":"现货","launch":"2042-01-12","desc":"整面墙壁变为全息显示屏，支持8K 3D沉浸观影，无需幕布","params":"显示尺寸:最大100吋-200吋自适应,分辨率:8K,亮度:3000流明,音响:空间音频全景声"},
    {"id":"G1015","name":"智能情绪香氛系统","category1":"家居生活","category2":"香氛","brand":"嗅界","spec":"MOOD-SENSE","color":"极简白","price":1299,"stock":"现货","launch":"2042-02-20","desc":"根据心率、天气、时间自动调配复合香氛，支持自定义场景","params":"香氛胶囊:24种基础香型,混合方案:200+,控制方式:语音/APP/脑机"},
    {"id":"G1016","name":"量子加密个人云服务器","category1":"数码存储","category2":"云设备","brand":"安存量子","spec":"Q-SAFE","color":"黑","price":5999,"stock":"现货","launch":"2042-01-08","desc":"本地私有云，量子密钥分发，家庭数据永不泄露","params":"存储容量:20TB,加密协议:QKD,支持自动备份,同时连接设备:50台"},
    {"id":"G1017","name":"仿生外骨骼登山套装","category1":"户外运动","category2":"登山装备","brand":"力甲","spec":"EXO-TREK","color":"碳纤黑","price":7999,"stock":"现货","launch":"2042-03-05","desc":"减轻负重感，增强腿部力量，适合长距离徒步","params":"助力模式:3档,续航:12小时,最大负重辅助:30kg,防水等级:IP68"},
    {"id":"G1018","name":"太空食品综合包（30天口粮）","category1":"食品酒饮","category2":"应急食品","brand":"星际粮仓","spec":"SPACE-MEAL","color":"银色包装","price":1999,"stock":"现货","launch":"2042-01-22","desc":"航天级冻干+营养重组，保质期10年，含早中晚餐及零食","params":"热量:2000kcal/天,口味:6种可选,复水方式:常温或自加热,重量:2.8kg/包"},
    {"id":"G1019","name":"智能药盒+AI药师服务","category1":"医疗健康","category2":"智能健康","brand":"康芯","spec":"MED-BOX","color":"白色","price":599,"stock":"现货","launch":"2042-02-18","desc":"自动分药、提醒用药，AI药师可视频解答用药疑问","params":"药仓数量:7格,支持远程配药同步,AI药师资质:执业药师认证,订阅:29/月"},
    {"id":"G1020","name":"可编程物质儿童教育套装","category1":"玩具","category2":"科教玩具","brand":"造物工坊","spec":"MATTER-KIT","color":"多彩","price":2499,"stock":"现货","launch":"2042-01-30","desc":"通过平板编程让纳米材料变形为指定形状，培养创造力","params":"材料类型:可编程聚合物,编程语言:图形化,成形精度:0.1mm,适用年龄:8+"},
    {"id":"G1021","name":"智能睡眠舱（单人办公午休）","category1":"家居生活","category2":"家具","brand":"眠宇宙","spec":"SLEEP-POD","color":"白/灰","price":6999,"stock":"现货","launch":"2042-02-25","desc":"隔音、遮光、智能控温，含助眠声光系统，适合办公室或家庭","params":"尺寸:2.2mx0.9mx1.2m,噪音隔绝:35dB,助眠程序:12种,供电:无线充电地板"},
    {"id":"G1022","name":"视网膜投影手机（无屏手机）","category1":"数码通讯","category2":"手机","brand":"幻眸","spec":"PHONE-R","color":"透明/黑","price":7999,"stock":"现货","launch":"2042-01-05","desc":"直接投影至视网膜，无实体屏幕，支持隐私模式","params":"投影分辨率:双眼4K,视场角:80°,处理器:量子AI芯片,防水:IP69"},
    {"id":"G1023","name":"碳足迹清零个人订阅","category1":"数字服务","category2":"环保服务","brand":"绿色2042","spec":"ZERO-CARBON","color":"数字凭证","price":"199/月","stock":"现货","launch":"2042-01-01","desc":"每月核算个人碳足迹，通过碳汇项目抵消，颁发数字徽章","params":"覆盖范围:出行/用电/购物,抵消项目:海洋碳汇+森林保护,报告:每月推送"},
    {"id":"G1024","name":"自修复智能轮胎（单车/滑板）","category1":"出行配件","category2":"轮胎","brand":"滚动未来","spec":"SELF-HEAL","color":"黑","price":599,"stock":"现货","launch":"2042-02-12","desc":"遇刺扎可自动修复，内置胎压传感，适配城市代步工具","params":"尺寸:12-20英寸适配,修复能力:≤5mm刺孔自动密封,胎压监测:蓝牙实时"},
    {"id":"G1025","name":"全息钓鱼模拟器","category1":"户外运动","category2":"虚拟运动","brand":"渔趣科技","spec":"HOLO-FISH","color":"自然色","price":3999,"stock":"现货","launch":"2042-03-10","desc":"室内体验全球钓场，真实力反馈鱼竿，支持多人联机","params":"钓场数量:50+,力反馈精度:0.1N,分辨率:4K全息,配件:仿真鱼竿套装"},
    {"id":"G1026","name":"太空植物奶精酿机","category1":"家电厨电","category2":"饮品设备","brand":"醇造未来","spec":"MILK-BREW","color":"金属银","price":1599,"stock":"现货","launch":"2042-02-08","desc":"用植物蛋白发酵制作酸奶、奶酪、植物奶，一键完成","params":"发酵时间:4-12小时可调,容量:1L,食谱程序:20种,支持手机遥控"},
    {"id":"G1027","name":"智能戒指（健康监测）","category1":"智能穿戴","category2":"健康监测","brand":"指环王","spec":"RING-SENSE","color":"黑/金/玫瑰金","price":899,"stock":"现货","launch":"2042-01-28","desc":"监测心率、血氧、体温、睡眠，续航30天，支持支付","params":"传感器:光电+温度,防水:50米,交互:触摸+手势,数据同步:云端健康档案"},
    {"id":"G1028","name":"虚拟现实社交空间（年卡）","category1":"数字服务","category2":"虚拟世界","brand":"元界2042","spec":"META-SPACE","color":"无","price":"1299/年","stock":"现货","launch":"2042-01-15","desc":"沉浸式VR社交平台，可自定义虚拟形象，举办活动、办公","params":"同时在线人数:单空间最高200人,设备支持:VR/AR/脑机,活动模板:100+"},
    {"id":"G1029","name":"仿生无人机观鸟相机","category1":"摄影器材","category2":"无人机","brand":"羽翼科技","spec":"BIRD-EYE","color":"白/绿","price":4999,"stock":"现货","launch":"2042-03-20","desc":"仿生鸟类外观，超静音，可接近野生动物，4K拍摄","params":"噪音:<20dB,最大飞行时间:45分钟,相机:4K 60fps,避障:全向视觉"},
    {"id":"G1030","name":"个性化基因护肤精华（定制）","category1":"个护健康","category2":"护肤品","brand":"基茵","spec":"DNA-SERUM","color":"定制瓶","price":"待定","stock":"即将上线","launch":"待定","desc":"即将推出，敬请期待","params":"待公布"}
]

PRODUCT_NAME_MAP = {p["id"]: p["name"] for p in PRODUCTS}


def get_product_name(product_id: str) -> str:
    return PRODUCT_NAME_MAP.get(product_id, f"商品{product_id}")


def today_str() -> str:
    now = datetime.now()
    return f"{now.year}-{now.month:02d}-{now.day:02d}"
