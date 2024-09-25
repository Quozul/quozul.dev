#!/bin/sh

mkdir -p dt-bindings/clock/
mkdir -p dt-bindings/power/
mkdir -p dt-bindings/reset/
mkdir -p dt-bindings/thermal/
mkdir -p dt-bindings/gpio/
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/include/dt-bindings/clock/starfive%2Cjh7110-crg.h
mv starfive,jh7110-crg.h dt-bindings/clock/starfive,jh7110-crg.h
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/include/dt-bindings/power/starfive%2Cjh7110-pmu.h
mv starfive,jh7110-pmu.h dt-bindings/power/starfive,jh7110-pmu.h
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/include/dt-bindings/reset/starfive%2Cjh7110-crg.h
mv starfive,jh7110-crg.h dt-bindings/reset/starfive,jh7110-crg.h
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/include/dt-bindings/thermal/thermal.h
mv thermal.h dt-bindings/thermal/thermal.h
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/include/dt-bindings/gpio/gpio.h
mv gpio.h dt-bindings/gpio/gpio.h
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/arch/riscv/boot/dts/starfive/jh7110-pinfunc.h
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/arch/riscv/boot/dts/starfive/jh7110-starfive-visionfive-2-v1.2a.dts
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/arch/riscv/boot/dts/starfive/jh7110-starfive-visionfive-2-v1.3b.dts
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/arch/riscv/boot/dts/starfive/jh7110-starfive-visionfive-2.dtsi
wget https://raw.githubusercontent.com/starfive-tech/linux/JH7110_VisionFive2_upstream/arch/riscv/boot/dts/starfive/jh7110.dtsi
sed -i 's/<dt-bindings\/clock\/starfive,jh7110-crg.h>/"dt-bindings\/clock\/starfive,jh7110-crg.h"/g' jh7110.dtsi
sed -i 's/<dt-bindings\/power\/starfive,jh7110-pmu.h>/"dt-bindings\/power\/starfive,jh7110-pmu.h"/g' jh7110.dtsi
sed -i 's/<dt-bindings\/reset\/starfive,jh7110-crg.h>/"dt-bindings\/reset\/starfive,jh7110-crg.h"/g' jh7110.dtsi
sed -i 's/<dt-bindings\/thermal\/thermal.h>/"dt-bindings\/thermal\/thermal.h"/g' jh7110.dtsi
sed -i 's/<dt-bindings\/gpio\/gpio.h>/"dt-bindings\/gpio\/gpio.h"/g' jh7110-starfive-visionfive-2.dtsi
cpp -nostdinc -I include -undef -x assembler-with-cpp jh7110-starfive-visionfive-2-v1.2a.dts > jh7110-starfive-visionfive-2-v1.2a.tmp.dts
dtc -O dtb -b 0 -o jh7110-starfive-visionfive-2-v1.2a.dtb jh7110-starfive-visionfive-2-v1.2a.tmp.dts
rm jh7110-starfive-visionfive-2-v1.2a.tmp.dts
dtc -I dtb -O dts jh7110-starfive-visionfive-2-v1.2a.dtb > jh7110-starfive-visionfive-2-v1.2a-full.dts
cpp -nostdinc -I include -undef -x assembler-with-cpp jh7110-starfive-visionfive-2-v1.3b.dts > jh7110-starfive-visionfive-2-v1.3b.tmp.dts
dtc -O dtb -b 0 -o jh7110-starfive-visionfive-2-v1.3b.dtb jh7110-starfive-visionfive-2-v1.3b.tmp.dts
rm jh7110-starfive-visionfive-2-v1.3b.tmp.dts
dtc -I dtb -O dts jh7110-starfive-visionfive-2-v1.3b.dtb > jh7110-starfive-visionfive-2-v1.3b-full.dts
