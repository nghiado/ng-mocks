import { Directive, EventEmitter, Inject, Optional, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MockOf } from '../common';
import { directiveResolver } from '../common/reflect';

const cache = new Map<Type<Directive>, Type<Directive>>();

export function MockDirectives<TDirective>(...directives: Array<Type<TDirective>>): Array<Type<TDirective>> {
  return directives.map(MockDirective);
}

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<TDirective> {
  const cacheHit = cache.get(directive);
  if (cacheHit) {
    return cacheHit as Type<TDirective>;
  }

  const { selector, exportAs, inputs, outputs } = directiveResolver.resolve(directive);
  // tslint:disable:no-unnecessary-class
  @MockOf(directive)
  @Directive({ exportAs, inputs, outputs, selector })
  class DirectiveMock {
    constructor(@Optional() @Inject(TemplateRef) templateRef?: TemplateRef<any>,
                @Optional() @Inject(ViewContainerRef) viewContainer?: ViewContainerRef) {
      (outputs || []).forEach((output) => {
        (this as any)[output.split(':')[0]] = new EventEmitter<any>();
      });

      if (templateRef && viewContainer) {
        viewContainer.createEmbeddedView(templateRef);
      }
    }
  }
  // tslint:enable:no-unnecessary-class

  cache.set(directive, DirectiveMock);

  return DirectiveMock as Type<TDirective>;
}
