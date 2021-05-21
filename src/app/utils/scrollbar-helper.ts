import PerfectScrollbar from 'perfect-scrollbar'
import * as CSS from 'perfect-scrollbar/src/lib/css'
import cls from 'perfect-scrollbar/src/lib/class-names'
import updateGeometry from 'perfect-scrollbar/src/update-geometry'
import { env } from 'perfect-scrollbar/src/lib/util'

export class ScrollBarHelper {
  public static makeScrollbar(ele: any, options?): PerfectScrollbar {
    return new PerfectScrollbar(ele, options)
  }

  public static isScrollbarMutation(record: MutationRecord) {
    const node = (record.addedNodes[0] || record.removedNodes[0]) as HTMLElement
    return (
      node != null &&
      node.tagName === 'DIV' &&
      ['ps__rail-x', 'ps__thumb-x', 'ps__rail-y', 'ps__thumb-y'].includes(node.className)
    )
  }
}

/**
 * 将滚动条插件与元素 element 的 wheel 事件绑定
 * @param i 滚动条插件实例
 * @param element 被监听鼠标滚轮事件的元素
 */
export function bindWheel(i: PerfectScrollbar, element: HTMLElement) {
  function shouldPreventDefault(deltaX: number, deltaY: number) {
    const roundedScrollTop = Math.floor(element.scrollTop)
    const isTop = element.scrollTop === 0
    const isBottom = roundedScrollTop + element.offsetHeight === element.scrollHeight
    const isLeft = element.scrollLeft === 0
    const isRight = element.scrollLeft + element.offsetWidth === element.scrollWidth

    const hitsBound = Math.abs(deltaY) > Math.abs(deltaX) ? isTop || isBottom : isLeft || isRight

    return hitsBound ? !i.settings.wheelPropagation : true
  }

  function getDeltaFromEvent(e: WheelEvent) {
    let deltaX = e.deltaX
    let deltaY = -1 * e.deltaY

    if (typeof deltaX === 'undefined' || typeof deltaY === 'undefined') {
      // OS X Safari
      deltaX = (-1 * (e as any).wheelDeltaX) / 6
      deltaY = (e as any).wheelDeltaY / 6
    }

    if (e.deltaMode && e.deltaMode === 1) {
      // Firefox in deltaMode 1: Line scrolling
      deltaX *= 10
      deltaY *= 10
    }

    if (deltaX !== deltaX && deltaY !== deltaY /* NaN checks */) {
      // IE in some mouse drivers
      deltaX = 0
      deltaY = (e as any).wheelDelta
    }

    if (e.shiftKey) {
      // reverse axis with shift key
      return [-deltaY, -deltaX]
    }
    return [deltaX, deltaY]
  }

  function shouldBeConsumedByChild(target: HTMLElement, deltaX: number, deltaY: number) {
    if (!env.isWebKit && element.querySelector('select:focus')) {
      return true
    }

    if (!element.contains(target)) {
      return false
    }

    let cursor = target

    while (cursor && cursor !== element) {
      if (cursor.classList.contains(cls.element.consuming)) {
        return true
      }

      const style = CSS.get(cursor)

      // if deltaY && vertical scrollable
      if (deltaY && style.overflowY.match(/(scroll|auto)/)) {
        const maxScrollTop = cursor.scrollHeight - cursor.clientHeight
        if (maxScrollTop > 0) {
          if ((cursor.scrollTop > 0 && deltaY < 0) || (cursor.scrollTop < maxScrollTop && deltaY > 0)) {
            return true
          }
        }
      }
      // if deltaX && horizontal scrollable
      if (deltaX && style.overflowX.match(/(scroll|auto)/)) {
        const maxScrollLeft = cursor.scrollWidth - cursor.clientWidth
        if (maxScrollLeft > 0) {
          if ((cursor.scrollLeft > 0 && deltaX < 0) || (cursor.scrollLeft < maxScrollLeft && deltaX > 0)) {
            return true
          }
        }
      }

      cursor = cursor.parentNode as HTMLElement
    }

    return false
  }

  function mousewheelHandler(e: WheelEvent) {
    const [deltaX, deltaY] = getDeltaFromEvent(e)

    if (shouldBeConsumedByChild(e.target as HTMLElement, deltaX, deltaY)) {
      return
    }

    let shouldPrevent = false
    if (!i.settings.useBothWheelAxes) {
      // deltaX will only be used for horizontal scrolling and deltaY will
      // only be used for vertical scrolling - this is the default
      i.element.scrollTop -= deltaY * i.settings.wheelSpeed
      i.element.scrollLeft += deltaX * i.settings.wheelSpeed
    } else if (i.scrollbarYActive && !i.scrollbarXActive) {
      // only vertical scrollbar is active and useBothWheelAxes option is
      // active, so let's scroll vertical bar using both mouse wheel axes
      if (deltaY) {
        i.element.scrollTop -= deltaY * i.settings.wheelSpeed
      } else {
        i.element.scrollTop += deltaX * i.settings.wheelSpeed
      }
      shouldPrevent = true
    } else if (i.scrollbarXActive && !i.scrollbarYActive) {
      // useBothWheelAxes and only horizontal bar is active, so use both
      // wheel axes for horizontal bar
      if (deltaX) {
        i.element.scrollLeft += deltaX * i.settings.wheelSpeed
      } else {
        i.element.scrollLeft -= deltaY * i.settings.wheelSpeed
      }
      shouldPrevent = true
    }

    updateGeometry(i)

    shouldPrevent = shouldPrevent || shouldPreventDefault(deltaX, deltaY)
    if (shouldPrevent && !e.ctrlKey) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  if (typeof window.onwheel !== 'undefined') {
    ;(i as any).event.bind(element, 'wheel', mousewheelHandler)
  } else if (typeof window.onmousewheel !== 'undefined') {
    ;(i as any).event.bind(element, 'mousewheel', mousewheelHandler)
  }
}

export function scrollToTop(i: PerfectScrollbar) {
  i.element.scrollTop = 0
}
